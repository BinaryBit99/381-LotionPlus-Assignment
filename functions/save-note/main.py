# add your save-note function here

# add your save-note function here
import json

def save_handler(event, context):
    http_method = event["requestContext"]["http"]["method"].lower()
    invoker = None

    if http_method == "post" or http_method == "put":
        # POST and PUT use the request body to get info about the request
        body = json.loads(event["body"])
        invoker = body["invoker"]

    return {
        "statusCode": 200,
        "body": json.dumps({
            "method": http_method,
            "invoker": invoker
        })
    }
