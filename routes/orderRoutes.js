const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/Wrapasync');
const Order = require('../models/Order');
const Product = require('../models/product');
const { isLoggedin } = require('../middleware/index');

// Route to display orders in admin panel
router.get('/admin/orders', wrapAsync(async (req, res) => {
  const orders = await Order.find().populate('product');
  res.render('./admin/orders', { orders });
}));

// Route to handle "Get Quotation" button
router.post('/user/product/:productId/get-quotation', isLoggedin, wrapAsync(async (req, res) => {
  const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect(`/user/product/${productId}`);
    }
    // Create an order for the product
    const order = {
      product: product._id,
      user: req.user._id,
      quantity: 1, // You can adjust the quantity as needed
      status: 'Pending', // Default status for new orders
    };

    // Save the order to the database
    const newOrder = new Order(order);
    await newOrder.save();

    req.flash('success', 'Quotation request sent');
  
 
}));

// Route to update order status
router.put('/admin/orders/:orderId', wrapAsync(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    req.flash('error', 'Order not found');
    return res.redirect('/admin/orders');
  }

  order.status = status;
  await order.save();

  req.flash('success', 'Order status updated');
  res.redirect('/admin/orders');
}));
// Route to delete an order
router.delete('/admin/orders/:orderId', wrapAsync(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    req.flash('error', 'Order not found');
    return res.redirect('/admin/orders');
  }

  // Delete the order
  await order.remove();

  req.flash('success', 'Order deleted');
  res.redirect('/admin/orders');
}));



module.exports = router;
