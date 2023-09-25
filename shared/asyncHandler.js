export const asyncHandler = (handler) => async (event, context) => {
  try {
    return await handler(event, context);
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
