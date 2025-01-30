import mongoose from "mongoose";

const schema = new mongoose.Schema({
  coupon: {
    type: String,
    unique: true,
    required: [true, "Please enter the coupon code!"],
  },
  amount: {
    type: Number,
    required: [true, "Please enter the amount of discount!"],
  },
});

export const Coupon = mongoose.model("Coupon", schema);
