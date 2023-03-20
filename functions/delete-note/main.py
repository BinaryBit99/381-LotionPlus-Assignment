# add your delete-note function here

import json 
import boto3

def delete_handler(event, context):
    http_method = event["requestContext"]["http"]["method"].lower()
    invoker = None

    if http_method == "delete":
        # DELETE use query string parameters to get info about the request
        invoker = event["queryStringParameters"]["invoker"]
    
    return {
        "statusCode": 200,
        "body": json.dumps({
            "method": http_method,
            "invoker": invoker
        })
    }
