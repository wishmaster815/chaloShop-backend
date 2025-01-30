import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name!"],
    },
    photo: {
      type: String,
      required: [true, "Please add photo of the product!"],
    },
    price: {
      type: Number,
      required: [true, "Please enter price!"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter stock!"],
    },
    category: {
      type: String,
      required: [true, "Please provide category of product!"],
      trim:true
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", schema);