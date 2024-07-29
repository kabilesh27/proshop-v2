import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
  createProductReviewController,
  getTopProductsController,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';

router.route('/').get(getProducts).post(protect, admin, createProductController);
router.route('/:id/reviews').post(protect, checkObjectId, createProductReviewController);
router.get('/top', getTopProductsController);
router
  .route('/:id')
  .get(checkObjectId, getProductByIdController)
  .put(protect, admin, checkObjectId, updateProductController)
  .delete(protect, admin, checkObjectId, deleteProductController);

export default router;
