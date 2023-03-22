import json 
import boto3
import urllib.request

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30146985")

def save_handler(event, context):
    body = json.loads(event["body"])
    email = event["headers"]["email"]
    access_token = event["headers"]["authorization"].split()[1]
    print(email)
    print(access_token)

    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={access_token}"
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())

        print(data)
        if data["email"] != email:
            return {
                "statusCode": 401,
                "body": json.dumps({
                    "message": "Unauthorized"
                })
            }

        table.put_item(Item=body)
        return {
            "statusCode": 200,
                "body": json.dumps({
                    "message": "success"
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
