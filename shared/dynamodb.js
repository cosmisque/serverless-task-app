import AWS from "aws-sdk";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

let dynamodb;

if (process.env.NODE_ENV === "development") {
  dynamodb = new AWS.DynamoDB({
    apiVersion: "2012-08-10",
    region: "localhost",
    endpoint: "http://0.0.0.0:8000",
  });
} else {
  dynamodb = new AWS.DynamoDB({
    apiVersion: "2012-08-10",
    region: "ap-southeast-1",
  });
}

export { dynamodb };
