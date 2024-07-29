import { docClient } from '../config/db.js';

const TableName = 'Orders';

// Helper function to generate unique IDs
const generateId = () => Date.now().toString();

// Fetch all orders
const getAllOrders = async () => {
  const params = {
    TableName,
  };
  const result = await docClient.scan(params).promise();
  return result.Items;
};

// Fetch order by ID
const getOrderById = async (orderId) => {
  const params = {
    TableName,
    Key: { orderId },
  };
  const result = await docClient.get(params).promise();
  return result.Item;
};

// Create order
const createOrder = async (order) => {
  const params = {
    TableName,
    Item: order,
  };
  await docClient.put(params).promise();
  return order;
};

// Update order
const updateOrder = async (orderId, updateParams) => {
  const params = {
    TableName,
    Key: { orderId },
    UpdateExpression: `set ${Object.keys(updateParams).map((k, i) => `#${k} = :${k}`).join(', ')}`,
    ExpressionAttributeNames: Object.keys(updateParams).reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {}),
    ExpressionAttributeValues: Object.keys(updateParams).reduce((acc, k) => ({ ...acc, [`:${k}`]: updateParams[k] }), {}),
    ReturnValues: 'ALL_NEW',
  };
  const result = await docClient.update(params).promise();
  return result.Attributes;
};

// Delete order
const deleteOrder = async (orderId) => {
  const params = {
    TableName,
    Key: { orderId },
  };
  await docClient.delete(params).promise();
};

export {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  generateId,
};
