// setuping for making database in mongoDB and then using this in app.ts
import mongoose from "mongoose";
import { invalidateCacheProps, orderItemsType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";
import { Document } from "mongoose";

export const connectDB = (mongo_uri: string) => {
  mongoose
    .connect(mongo_uri, {
      dbName: "ChaloShopDB",
    })
    .then((c) => console.log(`DB connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const invalidateCache = ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: invalidateCacheProps) => {
  if (product) {
    const productkey: string[] = [
      "latest-products",
      "mycategories",
      "all-products",
    ];
    // if there is single prodcut in the orderItems
    if (typeof productId === "string") {
      productkey.push(`product-${productId}`);
    }

    // if there is multiple prodcuts in orderitems (i.e array/ object is there in the orderItems then we have to iterate through each orderItem )
    if (typeof productId === "object") {
      productkey.forEach((i) => {
        productkey.push(`product-${i}`);
      });
    }

    myCache.del(productkey);
  }

  if (order) {
    const orderkey: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `my-orders-${orderId}`,
    ];
    myCache.del(orderkey);
  }
  if (admin) {
    myCache.del([
      "admin-stats",
      "admin-pie-chart",
      "admin-pie-chart",
      "admin-line-charts",
    ]);
  }
};

export const reduceStock = async (orderItems: orderItemsType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) {
      throw new Error("Product not found!");
    }

    product.stock -= order.quantity;
  }
};

// admin dashboard stats code
export const calcuatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percentage = ((thisMonth - lastMonth) / lastMonth) * 100;
  return Number(percentage.toFixed(0));
};

interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}
type FuncProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: "discount" | "total";
};

export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: FuncProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (monthDiff < length) {
      if (property) {
        data[length - monthDiff - 1] += i[property]!;
      } else {
        data[length - monthDiff - 1] += 1;
      }
    }
  });

  return data;
};
