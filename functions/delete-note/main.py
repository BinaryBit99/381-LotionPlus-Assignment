# add your delete-note function here

import json 
import boto3

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30146985")

def delete_handler(event, context):
    body = json.loads(event["body"])
    print(body)
    try:
        table.delete_item(Key=body)

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
