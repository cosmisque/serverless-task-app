import {  DynamoDBClient } from "@aws-sdk/client-dynamodb";




  const dynamodb = new DynamoDBClient({
    region: "ap-southeast-1",
  });


export { dynamodb };
