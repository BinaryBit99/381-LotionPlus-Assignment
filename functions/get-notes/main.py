# add your get-notes function here

import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30146985")

def get_handler(event, context):
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
