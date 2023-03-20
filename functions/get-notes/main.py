# add your get-notes function here

import json
import boto3

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion")

def get_handler(event, context):
    body = event["body"]
    try:
        table.get_item(Key={"email": body["email"]})
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

    response = table.get_item(Key={"student_id": student_id})
    item = response["Item"]
    return item
