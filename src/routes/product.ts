import express from "express";
import {
  deleteProduct,
  getAdminProducts,
  getCategories,
  getLatestProducts,
  getReqProducts,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controllers/product.js";
import { adminOnly } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";

const app = express.Router();

// route -> /api/v1/product/new
app.post("/new", adminOnly, singleUpload, newProduct);

// route -> /api/v1/product/all
// get all products with filter
app.get("/all", getReqProducts);

app.get("/admin-products", getAdminProducts);

// route -> /api/v1/product/latest
app.get("/latest", getLatestProducts);

// route -> /api/v1/product/categories
app.get("/categories", getCategories);

// route -> /api/v1/product/id
app
  .route("/:id")
  .get(getSingleProduct)
  .put(adminOnly, singleUpload, updateProduct)
  .delete(adminOnly, deleteProduct);

export default app;
