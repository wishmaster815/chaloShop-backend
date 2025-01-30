import { Request } from "express";
import { TryCatch } from "../middlewares/errorHandler.js";
import { newOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import errorHandler from "../utils/err-utility-class.js";
import { myCache } from "../app.js";

// only admin can access this
export const allOrders = TryCatch(async (req, res, next) => {
  let orders = [];

  const key = "all-orders";

  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    // in this the problem is that when we are accessing the orders it is givin by user id not ny name so for this feature to happen where the admin can see the orders places by users we use populate method
    const orders = await Order.find().populate("user", "name");
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const myOrders = TryCatch(async (req, res, next) => {
  const { id: user } = req.query;

  let orders = [];

  const key = `my-orders-${user}`;

  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    orders = await Order.find({ user });
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  let order;

  const key = `my-orders-${id}`;

  if (myCache.has(key)) {
    order = JSON.parse(myCache.get(key) as string);
  } else {
    order = await Order.findById(id).populate("user", "name");

    if (!order) return next(new errorHandler("Order not found!", 404));

    myCache.set(key, JSON.stringify(order));
  }

  return res.status(200).json({
    success: true,
    order,
  });
});

export const newOrder = TryCatch(
  async (req: Request<{}, {}, newOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      user,
      subtotal,
      tax,
      discount,
      shippingCharges,
      total,
      status,
      orderItems,
    } = req.body;

    if (
      !shippingInfo ||
      !user ||
      !subtotal ||
      !tax ||
      !discount ||
      !shippingCharges ||
      !total ||
      !status ||
      !orderItems
    )
      return next(new errorHandler("All entries are compulsary!", 400));

    const order = await Order.create({
      shippingInfo,
      user,
      subtotal,
      tax,
      discount,
      shippingCharges,
      total,
      status,
      orderItems,
    });

    // reducing the stock of the item
    await reduceStock(orderItems);

    const temp = order.orderItems.map((item) => String(item.productId));

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: temp,
    });

    return res.status(200).json({
      success: true,
      message: "Order created successfully!",
    });
  }
);

export const processOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return next(new errorHandler("Order not found!", 404));

  // for defining different stages
  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;

    case "Shipped":
      order.status = "Delivered";
      break;

    default:
      order.status = "Delivered";
      break;
  }

  await order.save();
  invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order processed successfully!",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) return next(new errorHandler("Order not found!", 404));

  await order.deleteOne();
  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user,
    orderId: String(order._id),
  });

  return res.status(200).json({
    success: true,
    message: "Order deleted successfully!",
  });
});
