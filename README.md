<!--
title: 'AWS NodeJS Example'
description: 'This template demonstrates how to deploy a NodeJS function running on AWS Lambda using the traditional Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

## For this project

### Start local db

```bash
docker compose up
```

### Table creation for local docker

```bash
serverless dynamodb migrate
```

### Delete Table

```bash
aws dynamodb delete-table --table-name Users --endpoint-url http://localhost:8000
aws dynamodb delete-table --table-name Tasks --endpoint-url http://localhost:8000
```

### Verify table creation

```bash
aws dynamodb describe-table --table-name Tasks --endpoint-url http://localhost:8000

aws dynamodb describe-table  --table-name Users --endpoint-url http://localhost:8000
```

### Query

```bash
aws dynamodb scan --table-name Tasks --endpoint-url http://localhost:8000
aws dynamodb scan --table-name Users --endpoint-url http://localhost:8000
```

## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
$ serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying aws-node-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-project-dev (112s)

functions:
  hello: aws-node-project-dev-hello (1.5 kB)
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```bash
serverless invoke --function hello
```

Which should result in response similar to the following:

```json
{
  "statusCode": 200,
  "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": {}\n}"
}
```

Which should result in response similar to the following:

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```
