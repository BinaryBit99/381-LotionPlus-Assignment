import json 
import boto3

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30146985")

def save_handler(event, context):

    body = json.loads(event["body"])
    try:
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
