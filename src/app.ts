import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { connectDB } from "./utils/features.js";
import { errorMiddleWare } from "./middlewares/errorHandler.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors";

import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import couponRoutes from "./routes/payment.js";
import dashboardRoutes from "./routes/adminStats.js";
import Stripe from "stripe";
import Razorpay from "razorpay";

config({ path: "./.env" });

export const myCache = new NodeCache();

const port = process.env.PORT || 4000;
const mongo_uri = process.env.MONGO_URI || "";
const key_id = process.env.RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

// TODO: We have to delete this in future
// const stripeKey = process.env.STRIPE_KEY || "";

connectDB(mongo_uri);

// export const stripe = new Stripe(stripeKey);
export const razorpay = new Razorpay({ key_id, key_secret });

const app = express();

// this should be prior to any routes
app.use(express.json());
app.use(morgan("dev"));

// const allowedOrigins = [process.env.FRONTEND_URL || ""];
// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: ["GET", "PUT", "DELETE", "POST", "PATCH"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use(
  cors({
    origin: "http://localhost:5173", // Remove the trailing slash
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("API working successfully");
});

// a error middleware is needed at the end of every routes

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", couponRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleWare);

// creating error handling middlewares for it to apply in the end if there is some error
app.listen(port, () => {
  console.log(`Express is working on http://localhost:${port}`);
});
