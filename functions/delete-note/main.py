# add your delete-note function here

import json 
import boto3
import urllib.request

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30146985")

def delete_handler(event, context):
    email = event["headers"]["email"]
    access_token = event["headers"]["authorization"].split()[1]

    url = "https://www.googleapis.com/oauth2/v2/userinfo"

    req = urllib.request.Request(url, headers={"Authorization": f"OAuth {access_token}"})
    response =  urllib.request.urlopen(req)
    data = json.loads(response.read().decode())

    if data["email"] != email:
        return {
            "statusCode": 401,
            "body": json.dumps({
                "message": "Unauthorized"
            })
        }
    
    queryParameters = event["queryStringParameters"]
    try:
        table.delete_item(Key=queryParameters)

        return {
            "statusCode": 200,
            "body": json.dumps({
                    "message": "success"
            })
        }
        
    except Exception as exp:
        return {
            "statusCode": 500,
                "body": json.dumps({
                    "message":str(exp)
            })
        }
