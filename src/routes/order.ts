import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allOrders, newOrder, myOrders, getSingleOrder, processOrder, deleteOrder } from "../controllers/order.js";

const app = express.Router();

// route -> /api/v1/order/new
app.post("/new",newOrder)

app.get("/all",adminOnly,allOrders)

app.get("/my",myOrders);

app.route("/:id").get(getSingleOrder).put(adminOnly,processOrder).delete(adminOnly,deleteOrder);

export default app;