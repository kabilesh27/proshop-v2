import { docClient } from '../config/db.js';
import { v6 as uuidv6 } from 'uuid';

// Helper function to generate unique IDs
const generateId = () => uuidv6();

// Create a product
const createProduct = async (product) => {
  const params = {
    TableName: 'Products',
    Item: product,
  };
  await docClient.put(params).promise();
  return product;
};

// Get all products
const getAllProducts = async () => {
  const params = {
    TableName: 'Products',
  };
  const result = await docClient.scan(params).promise();
  return result.Items;
};

// Get product by ID
const getProductById = async (productId) => {
  const params = {
    TableName: 'Products',
    Key: { productId },
  };
  const result = await docClient.get(params).promise();
  return result.Item;
};

// Update product by ID
const updateProductById = async (productId, updateData) => {
  const params = {
    TableName: 'Products',
    Key: { productId },
    UpdateExpression: `set ${Object.keys(updateData).map((k, i) => `#${k} = :${k}`).join(', ')}`,
    ExpressionAttributeNames: Object.keys(updateData).reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {}),
    ExpressionAttributeValues: Object.keys(updateData).reduce((acc, k) => ({ ...acc, [`:${k}`]: updateData[k] }), {}),
    ReturnValues: 'ALL_NEW',
  };
  const result = await docClient.update(params).promise();
  return result.Attributes;
};

// Delete product by ID
const deleteProductById = async (productId) => {
  const params = {
    TableName: 'Products',
    Key: { productId },
  };
  await docClient.delete(params).promise();
};

// Add review to product
const addReviewToProduct = async (productId, review) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  product.reviews = product.reviews || [];
  product.reviews.push(review);

  // Recalculate rating and number of reviews
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  const updatedProduct = await updateProductById(productId, {
    reviews: product.reviews,
    numReviews: product.numReviews,
    rating: product.rating,
  });

  return updatedProduct;
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  addReviewToProduct,
  generateId,
};
