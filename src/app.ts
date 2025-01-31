import express, { NextFunction, Request, Response } from "express";
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
import Razorpay from "razorpay";

config({ path: "./.env" });

export const myCache = new NodeCache();

const port = process.env.PORT || 4000;
const mongo_uri = process.env.MONGO_URI || "";
const key_id = process.env.RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

// Optional: Store your frontend URL in the .env file
const allowedOrigins: string[] = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://chalo-shop-pb30svzau-jayesh-shrivastavas-projects.vercel.app",
];

connectDB(mongo_uri);

export const razorpay = new Razorpay({ key_id, key_secret });

const app = express();

// Middleware setup
app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API working successfully");
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", couponRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Serve static files
app.use("/uploads", express.static("uploads"));

// Error handling middleware
app.use(errorMiddleWare);

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`);
});
