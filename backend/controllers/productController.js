import asyncHandler from 'express-async-handler';
import { createProduct, getAllProducts, getProductById, updateProductById, deleteProductById, addReviewToProduct, generateId } from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await getAllProducts();
  res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductByIdController = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProductController = asyncHandler(async (req, res) => {
  const product = {
    productId: generateId(),
    user: req.user.userId,
    name: req.body.name,
    image: req.body.image,
    brand: req.body.brand,
    category: req.body.category,
    description: req.body.description,
    reviews: [],
    rating: 0,
    numReviews: 0,
    price: req.body.price,
    countInStock: req.body.countInStock,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const createdProduct = await createProduct(product);
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProductController = asyncHandler(async (req, res) => {
  const updateData = {
    name: req.body.name,
    image: req.body.image,
    brand: req.body.brand,
    category: req.body.category,
    description: req.body.description,
    price: req.body.price,
    countInStock: req.body.countInStock,
    updatedAt: new Date().toISOString(),
  };

  const updatedProduct = await updateProductById(req.params.id, updateData);
  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProductController = asyncHandler(async (req, res) => {
  await deleteProductById(req.params.id);
  res.json({ message: 'Product removed' });
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReviewController = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const { rating, comment } = req.body;
  const review = {
    name: req.user.name,
    rating,
    comment,
    user: req.user.userId,
  };
  const product = await addReviewToProduct(productId, review);
  res.status(201).json({ message: 'Review added', product });
});

// @desc    Get top products
// @route   GET /api/products/top
// @access  Public
const getTopProductsController = asyncHandler(async (req, res) => {
  const products = await getAllProducts(); // Assuming top products logic is implemented here
  const topProducts = products.sort((a, b) => b.rating - a.rating).slice(0, 3); // Example logic
  res.json(topProducts);
});

export {
  getProducts,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
  createProductReviewController,
  getTopProductsController,
};
