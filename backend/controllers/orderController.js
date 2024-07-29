import asyncHandler from 'express-async-handler';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  generateId,
} from '../models/orderModel.js';
import { docClient } from '../config/db.js';
import { getUserById } from '../models/userModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = {
      orderId: generateId(),
      userId: req.user.userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
      isDelivered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdOrder = await createOrder(order);
    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderByIdController = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.params.id);
  const user = await getUserById(order.userId);
  if (order) {
    res.json({ ...order, user });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  const updateParams = {
    isPaid: true,
    paidAt: new Date().toISOString(),
    paymentResult: {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    },
  };

  const updatedOrder = await updateOrder(orderId, updateParams);
  res.json(updatedOrder);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  const updateParams = {
    isDelivered: true,
    deliveredAt: new Date().toISOString(),
  };

  const updatedOrder = await updateOrder(orderId, updateParams);
  res.json(updatedOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  console.log(req.user.userId);

  const params = {
    TableName: 'Orders',
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': req.user.userId },
  };

  try {
    const result = await docClient.query(params).promise();
    res.json(result.Items);
  } catch (error) {
    console.error('Error querying orders:', error);
    res.status(500).json({ message: 'Error querying orders' });
  }
});


// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await getAllOrders();
  res.json(orders);
});

export {
  addOrderItems,
  getOrderByIdController,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
};
