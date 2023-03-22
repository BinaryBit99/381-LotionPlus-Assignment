# add your get-notes function here

import json
import boto3
from boto3.dynamodb.conditions import Key
import urllib.request

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30146985")

def get_handler(event, context):
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
    
    queryParameter = event["queryStringParameters"]
    try:
        res = table.query(KeyConditionExpression=Key("email").eq(queryParameter["email"]))
        return {
            "statusCode": 200,
                "body": json.dumps({
                    "message": "success",
                    "notes": res
                })
        }
    except Exception as exp:
        print(f"exception: {exp}")
        return {
            "statusCode": 500,
                "body": json.dumps({
                    "message":str(exp)
            })
        }
