# add your delete-note function here

import json 
import boto3

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion")

def delete_handler(event, context):
    body = event["body"]
    try:
        table.delete_item(
            Key={
                "id": body["id"],
            }

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
