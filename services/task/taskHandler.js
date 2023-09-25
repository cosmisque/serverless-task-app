import { v4 as uuidv4 } from "uuid";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { dynamodb } from "../../shared/dynamodb.js";

export const createTask = asyncHandler(async (event, context) => {
  const { userId, name, description, status } = JSON.parse(event.body);

  const userCheckParams = {
    TableName: "Users",
    Key: marshall({
      userId,
    }),
  };

  const userExist = await dynamodb.getItem(userCheckParams).promise();

  if (!userExist.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "User not found" }),
    };
  }

  const now = new Date().toISOString();

  const params = {
    TableName: "Tasks",
    Item: marshall({
      taskId: uuidv4(),
      userId: userId,
      name: name,
      description: description,
      status: status,
      createDate: now,
    }),
  };

  await dynamodb.putItem(params).promise();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.PROD_URL,
    },
    body: JSON.stringify({ message: "Task created successfully!" }),
  };
});

//GET /api/v1/task/{userId}?date=2023-08-15
//GET /api/v1/task/{userId}
export const getTasks = asyncHandler(async (event, context) => {
  const { userId } = event.pathParameters;
  const { date } = event.queryStringParameters || {};
  const params = {
    TableName: process.env.TASK_TABLE,
    IndexName: "userIdIndex",
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: marshall({
      ":uid": userId,
      ...(date ? { ":date": date } : {}),
    }),
  };

  if (date) {
    params.FilterExpression = "createDate = :date";
    params.ExpressionAttributeValues[":date"] = marshall({ date });
  }

  const result = await dynamodb.query(params).promise();

  const items = result.Items.map((item) => {
    return unmarshall(item);
  });

  const groupedTasks = {};

  items.forEach((task) => {
    const status = task.status;

    if (!groupedTasks[status]) {
      groupedTasks[status] = [];
    }

    groupedTasks[status].push({ ...task, id: status });
  });

  return {
    statusCode: 200,
    body: JSON.stringify(groupedTasks),
    headers: {
      "Access-Control-Allow-Origin": process.env.PROD_URL,
    },
  };
});

export const updateTaskByTaskId = asyncHandler(async (event, context) => {
  const { taskId } = event.pathParameters;
  const { userId, name, description } = JSON.parse(event.body);

  const updateParams = {
    TableName: process.env.TASK_TABLE,
    Key: marshall({
      taskId,
    }),
    UpdateExpression:
      "SET name = :name, description = :description, userId = :userId",
    ExpressionAttributeValues: marshall({
      ":name": name,
      ":description": description,
      ":userId": userId,
    }),
    ReturnValues: "ALL_NEW",
  };

  const updatedTask = await dynamodb.updateItem(updateParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(updatedTask.Attributes),
    headers: {
      "Access-Control-Allow-Origin": process.env.PROD_URL,
    },
  };
});

export const deleteTaskBytaskId = asyncHandler(async (event, context) => {
  const { taskId } = event.pathParameters;
  const deleteParams = {
    TableName: process.env.TASK_TABLE,
    Key: marshall({
      taskId,
    }),
  };

  await dynamodb.deleteItem(deleteParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Task deleted successfully" }),
    headers: {
      "Access-Control-Allow-Origin": process.env.PROD_URL,
    },
  };
});
