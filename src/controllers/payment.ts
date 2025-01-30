import { Request } from "express";
import { TryCatch } from "../middlewares/errorHandler.js";
import { newCouponRequestBody } from "../types/types.js";
import { Coupon } from "../models/coupons.js";
import errorHandler from "../utils/err-utility-class.js";
import { razorpay } from "../app.js";

// ! razorpay payment Integration
export const createPayment = TryCatch(async (req, res, next) => {
  const { amount, currency, receipt } = req.body;
  if (!amount) return next(new errorHandler("Please enter amount!", 400));

  const options = {
    amount: Number(amount) * 100, // Amount in paise
    currency,
    receipt,
  };

  const order = await razorpay.orders.create(options);

  return res.status(200).json({
    success: true,
    order,
  });
});

export const newCoupon = TryCatch(
  async (req: Request<{}, {}, newCouponRequestBody>, res, next) => {
    const { coupon, amount } = req.body;

    if (!coupon || !amount)
      return next(new errorHandler("All field are compulsary!", 400));

    await Coupon.create({ coupon, amount });

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon} created successfully!`,
    });
  }
);

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ coupon });

  if (!discount) return next(new errorHandler("Invalid coupon!", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupons = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});

  return res.status(200).json({
    success: true,
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) return next(new errorHandler("Invalid coupon!", 400));

  await coupon.deleteOne();

  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon.coupon} Deleted successfully`,
  });
});
