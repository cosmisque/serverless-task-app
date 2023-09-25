import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { dynamodb } from "../../shared/dynamodb.js";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";

export const addUser = asyncHandler(async (event, context) => {
  const userId = uuidv4();
  const params = {
    Item: marshall({
      userId,
    }),
    TableName: "Users",
  };

  const data = await dynamodb.putItem(params).promise();

  return {
    body: JSON.stringify({ userId }),
    headers: {
      "Access-Control-Allow-Origin": process.env.PROD_URL,
    },
  };
});
