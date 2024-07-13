import { v4 as uuidv4 } from "uuid";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { dynamodb } from "../../shared/dynamodb.js";
import { QueryCommand, DeleteItemCommand, GetItemCommand,UpdateItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";

export const createTask = asyncHandler(async (event, context) => {
  const { userId, name, description, status } = JSON.parse(event.body);

  // const userCheckParams = {
  //   TableName: "Users",
  //   Key: marshall({
  //     userId,
  //   }),
  // };

  // const command = new GetItemCommand(userCheckParams);
  // const userExist = await dynamodb.send(command);

  // if (!userExist.Item) {
  //   return {
  //     statusCode: 404,
  //     body: JSON.stringify({ error: "User not found" }),
  //   };
  // }


  const params = {
    TableName: "Tasks",
    Item: marshall({
      taskId: uuidv4(),
      userId: userId,
      name: name,
      description: description,
      status: status,
      createDate: new Date().toISOString(),
    }),
  };

  const result = await dynamodb.send(new PutItemCommand(params));

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "Task created successfully!" }),
  };
});


// //GET /api/v1/task/{userId}?date=2023-08-15
// //GET /api/v1/task/{userId}
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

  const command = new QueryCommand(params);
  const result = await dynamodb.send(command);

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
      "Access-Control-Allow-Origin": '*',
    },
  };
});

export const getTaskById = asyncHandler(async (event, context) => {
  const { taskId } = event.pathParameters;
  const params = {
    TableName: process.env.TASK_TABLE,
    Key: marshall({
      taskId,
    }),
  };

  const command = new GetItemCommand(params);
  const task = await dynamodb.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify(unmarshall(task.Item)),
    headers: {
      "Access-Control-Allow-Origin": '*',
    },
  };
});

export const updateTaskByTaskId = asyncHandler(async (event, context) => {
  const { taskId } = event.pathParameters;
  const { userId, name, description, status } = JSON.parse(event.body);

  const updateParams = {
    TableName: process.env.TASK_TABLE,
    Key: marshall({
      taskId,
    }),
    UpdateExpression:
      "SET #taskName = :taskName, description = :description, userId = :userId, #statusName = :status",
    ExpressionAttributeValues: marshall({
      ":taskName": name,
      ":taskName": name,
      ":description": description,
      ":userId": userId,
      ":status": status,
    }),
    ExpressionAttributeNames: {
      "#taskName": "name",
      "#statusName": "status",
    },
    ReturnValues: "ALL_NEW",
  };

  
  const command = new UpdateItemCommand(updateParams);
  const updatedTask = await dynamodb.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify(unmarshall(updatedTask.Attributes)),
    headers: {
      "Access-Control-Allow-Origin": '*',
    },
  };
});

export const deleteTaskByTaskId = asyncHandler(async (event, context) => {
  const { taskId } = event.pathParameters;
  const deleteParams = {
    TableName: process.env.TASK_TABLE,
    Key: marshall({
      taskId,
    }),
  };


  const command = new DeleteItemCommand(deleteParams);
  await dynamodb.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Task deleted successfully" }),
    headers: {
      "Access-Control-Allow-Origin": '*',
    },
  };
});
