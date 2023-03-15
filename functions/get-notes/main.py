# add your get-notes function here

import json

def get_handler(event, context):
    http_method = event["requestContext"]["http"]["method"].lower()
    invoker = None

    if http_method == "get":
        # GET use query string parameters to get info about the request
        invoker = event["queryStringParameters"]["invoker"]
    
    return {
        "statusCode": 200,
        "body": json.dumps({
            "method": http_method,
            "invoker": invoker
        })
    }
