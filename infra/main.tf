terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

# specify the provider region
provider "aws" {
  region = "ca-central-1"
}

# the locals block is used to declare constants that 
# you can use throughout your code
locals {
  delete_function_name = "delete-note-30147741"
  save_function_name = "save-note-30147741"
  get_function_name = "get-notes-30147741"

  delete_note_handler_name  = "main.delete_handler"
  get_notes_handler_name = "main.get_handler"
  save_note_handler_name = "main.save_handler"

  get_artifact_name = "artifact-get.zip"
  save_artifact_name = "artifact-save.zip"
  delete_artifact_name = "artifact-delete.zip"
}

# create a role for the Lambda function to assume
# every service on AWS that wants to call other AWS services should first assume a role and
# then any policy attached to the role will give permissions
# to the service so it can interact with other AWS services
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "lambda_role" {
  name               = "iam-for-lambda-lotion-plus"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# read the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
resource "aws_dynamodb_table" "lotion-30146985" {
  name         = "lotion-30146985"
  billing_mode = "PROVISIONED"

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
  write_capacity = 1

  hash_key = "email"
  range_key = "id"

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }
}

# create archive file from main.py
data "archive_file" "get-archive" {
  type = "zip"
  source_file = "../functions/get-notes/main.py" 
  output_path = "artifact-get.zip"
}

data "archive_file" "save-archive" {
  type = "zip"
  source_file = "../functions/save-note/main.py" 
  output_path = "artifact-save.zip"
}

data "archive_file" "delete-archive" {
  type = "zip"
  source_file = "../functions/delete-note/main.py" 
  output_path = "artifact-delete.zip"
}

resource "aws_lambda_function" "get-notes-30147741" {
  role             = aws_iam_role.lambda_role.arn
  function_name    = local.get_function_name
  handler          = local.get_notes_handler_name
  filename         = local.get_artifact_name
  source_code_hash = data.archive_file.get-archive.output_base64sha256

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}

resource "aws_lambda_function" "save-note-30147741" {
  role          = aws_iam_role.lambda_role.arn
  function_name = local.save_function_name
  handler       = local.save_note_handler_name
  filename      = local.save_artifact_name
  source_code_hash = data.archive_file.save-archive.output_base64sha256

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}

resource "aws_lambda_function" "delete-note-30147741" {
  role          = aws_iam_role.lambda_role.arn
  function_name = local.delete_function_name
  handler       = local.delete_note_handler_name
  filename      = local.delete_artifact_name
  source_code_hash = data.archive_file.delete-archive.output_base64sha256

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}

# create a policy for publishing logs to CloudWatch
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
resource "aws_iam_policy" "logs-and-dynamodb" {
  name        = "lambda-logging-and-dynamodb"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:DeleteItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": ["arn:aws:logs:*:*:*", "${aws_dynamodb_table.lotion-30146985.arn}"],
      "Effect": "Allow"
    }
  ]
}
EOF
}

# attach the above policy to the function role
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
resource "aws_iam_role_policy_attachment" "policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.logs-and-dynamodb.arn
}

# create a Function URL for Lambda 
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function_url
resource "aws_lambda_function_url" "save-url" {
  function_name      = aws_lambda_function.save-note-30147741.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"] #Can be empty array
  }
}


resource "aws_lambda_function_url" "delete-url" {
  function_name      = aws_lambda_function.delete-note-30147741.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

resource "aws_lambda_function_url" "get-notes-url" {
  function_name      = aws_lambda_function.get-notes-30147741.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# show the Function URL after creation
output "get_notes_url_output" {
    value = aws_lambda_function_url.get-notes-url.function_url
}

output "delete_note_url_output" {
    value = aws_lambda_function_url.delete-url.function_url
}

output "save_note_url_output" {
    value = aws_lambda_function_url.save-url.function_url
}


