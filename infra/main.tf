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
  delete_function_name = "delete"
  save_function_name = "save"
  get_function_name = "get"
  delete_note_handler_name  = "main.delete_handler"
  get_notes_handler_name = "main.get_handler"
  save_note_handler_name = "main.save_handler"
  delete_artifact_name = "${local.delete_function_name}/artifact.zip"
  get_artifact_name = "${local.get_function_name}/artifact.zip"
  save_artifact_name = "${local.save_function_name}/artifact.zip"
#   artifact_name = "${local.function_name}/artifact.zip"
}

# Create an S3 bucket
# if you omit the name, Terraform will assign a random name to it
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket
resource "aws_s3_bucket" "lambda" {}

# create a role for the Lambda function to assume
# every service on AWS that wants to call other AWS services should first assume a role and
# then any policy attached to the role will give permissions
# to the service so it can interact with other AWS services
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "delete_role" {
  name               = "iam-for-lambda-${local.delete_function_name}"
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

resource "aws_iam_role" "get_role" {
  name               = "iam-for-lambda-${local.get_function_name}"
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

resource "aws_iam_role" "save_role" {
  name               = "iam-for-lambda-${local.save_function_name}"
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

# create a Lambda function
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
resource "aws_lambda_function" "get-notes-30147741" {
  s3_bucket = aws_s3_bucket.lambda.bucket
  # the artifact needs to be in the bucket first. Otherwise, this will fail.
  s3_key        = local.get_artifact_name
  role          = aws_iam_role.get_role.arn
  function_name = local.get_function_name
  handler       = local.get_notes_handler_name

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}

resource "aws_lambda_function" "save-note-30147741" {
  s3_bucket = aws_s3_bucket.lambda.bucket
  # the artifact needs to be in the bucket first. Otherwise, this will fail.
  s3_key        = local.save_artifact_name
  role          = aws_iam_role.save_role.arn
  function_name = local.save_function_name
  handler       = local.save_note_handler_name

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}

resource "aws_lambda_function" "delete-note-30147741" {
  s3_bucket = aws_s3_bucket.lambda.bucket
  # the artifact needs to be in the bucket first. Otherwise, this will fail.
  s3_key        = local.delete_artifact_name 
  role          = aws_iam_role.delete_role.arn
  function_name = local.delete_function_name
  handler       = local.delete_note_handler_name

  # see all available runtimes here: https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html#SSS-CreateFunction-request-Runtime
  runtime = "python3.9"
}



# create a policy for publishing logs to CloudWatch
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
resource "aws_iam_policy" "logs" {
  name        = "lambda-logging-functions"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

# resource "aws_iam_policy" "save_logs" {
#   name        = "lambda-logging-${local.save_function_name}"
#   description = "IAM policy for logging from a lambda"

#   policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Action": [
#         "logs:CreateLogGroup",
#         "logs:CreateLogStream",
#         "logs:PutLogEvents"
#       ],
#       "Resource": "arn:aws:logs:*:*:*",
#       "Effect": "Allow"
#     }
#   ]
# }
# EOF
# }

# resource "aws_iam_policy" "get_logs" {
#   name        = "lambda-logging-${local.get_function_name}"
#   description = "IAM policy for logging from a lambda"

#   policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Action": [
#         "logs:CreateLogGroup",
#         "logs:CreateLogStream",
#         "logs:PutLogEvents"
#       ],
#       "Resource": "arn:aws:logs:*:*:*",
#       "Effect": "Allow"
#     }
#   ]
# }
# EOF
# }

# attach the above policy to the function role
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
resource "aws_iam_role_policy_attachment" "save_logs_attachment" {
  role       = aws_iam_role.save_role.name
  policy_arn = aws_iam_policy.logs.arn
}

resource "aws_iam_role_policy_attachment" "delete_logs_attachment" {
  role       = aws_iam_role.delete_role.name
  policy_arn = aws_iam_policy.logs.arn
}

resource "aws_iam_role_policy_attachment" "get_logs_attachment" {
  role       = aws_iam_role.get_role.name
  policy_arn = aws_iam_policy.logs.arn
}

# output the name of the bucket after creation
output "bucket_name" {
  value = aws_s3_bucket.lambda.bucket
}

# create a Function URL for Lambda 
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function_url
resource "aws_lambda_function_url" "save-url" {
  function_name      = aws_lambda_function.save-note-30147741.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST", "PUT"]
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


# read the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
resource "aws_dynamodb_table" "table-30146985" {
  name         = "lotion"
  billing_mode = "PROVISIONED"

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
  write_capacity = 1

  # we only need a student id to find an item in the table; therefore, we 
  # don't need a sort key here
  hash_key = "email"
  range_key = "id"

  # the hash_key data type is string
  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }
}
