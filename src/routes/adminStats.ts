// admin dashboard statistics routes
import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import {
  getDashboardStats,
  getPiechart,
  getBarchart,
  getLinechart,
} from "../controllers/adminStats.js";

const app = express.Router();

// route -> /api/v1/dashboard/stats
app.get("/stats", adminOnly, getDashboardStats);

// route -> /api/v1/dashboard/pie
app.get("/pie", adminOnly, getPiechart);

// route -> /api/v1/dashboard/bar
app.get("/bar", adminOnly, getBarchart);

// route -> /api/v1/dashboard/line
app.get("/line", adminOnly, getLinechart);

export default app;
