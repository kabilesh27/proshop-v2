import { docClient } from '../config/db.js';
import bcrypt from 'bcryptjs';

const TableName = 'Users';

// Helper function to generate unique IDs
const generateId = () => Date.now().toString();

// Create a user
const createUser = async (user) => {
  // Hash the password before saving
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const params = {
    TableName,
    Item: user,
  };
  await docClient.put(params).promise();
  return user;
};

// Get user by email
const getUserByEmail = async (email) => {
  const params = {
    TableName,
    IndexName: 'email-index', // Assuming you have a secondary index on email
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: { ':email': email },
  };
  const result = await docClient.query(params).promise();
  return result.Items[0];
};

// Get user by ID
const getUserById = async (userId) => {
  const params = {
    TableName,
    Key: { userId },
  };
  const result = await docClient.get(params).promise();
  return result.Item;
};

// Update user by ID
const updateUserById = async (userId, updateData) => {
  const params = {
    TableName,
    Key: { userId },
    UpdateExpression: `set ${Object.keys(updateData).map((k, i) => `#${k} = :${k}`).join(', ')}`,
    ExpressionAttributeNames: Object.keys(updateData).reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {}),
    ExpressionAttributeValues: Object.keys(updateData).reduce((acc, k) => ({ ...acc, [`:${k}`]: updateData[k] }), {}),
    ReturnValues: 'ALL_NEW',
  };
  const result = await docClient.update(params).promise();
  return result.Attributes;
};

// Match user entered password to hashed password in database
const matchPassword = async (enteredPassword, storedPassword) => {
  return await bcrypt.compare(enteredPassword, storedPassword);
};

export {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserById,
  matchPassword,
  generateId,
};
