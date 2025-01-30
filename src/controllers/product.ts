import { Request } from "express";
import { TryCatch } from "../middlewares/errorHandler.js";
import {
  BaseQuery,
  newProductRequestBody,
  searchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import errorHandler from "../utils/err-utility-class.js";
import { rm } from "fs";
import { faker } from "@faker-js/faker";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

// Revalidate on new, update, delete product and on new order
export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products = [];
  //  for optimisation of speed we are storing the value of latest products in cache memory and in case within that time interval there is a call for that product then it will be fetched from from the memory not the database
  if (myCache.has("latest-products")) {
    products = JSON.parse(myCache.get("latest-products") as string);
  } else {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    // adding the products into the cache for future references ( taking from cache memory instead of database for fast data retrieval)
    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Revalidate on new, update, delete product and on new order
export const getCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("mycategories")) {
    categories = JSON.parse(myCache.get("mycategories") as string);
  } else {
    const categories = await Product.distinct("category");
    myCache.set("mycategories", JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    categories,
  });
});

// Revalidate on new, update, delete product and on new order
export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;

  if (myCache.has(`product-${id}`)) {
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  } else {
    product = await Product.findById(id);

    if (!product) return next(new errorHandler("Product not found!", 404));

    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

// Revalidate on new, update, delete product and on new order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  } else {
    const products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, newProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    // checking if there is no photo of the product, give error
    if (!photo) return next(new errorHandler("Please add product photo!", 400));

    // checking whether all other product details are given or not
    // also making sure that if any entry is empty but photo is given then do not add photo into uploads folder

    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("Photo deleted!");
      });

      return next(new errorHandler("Enter all product details!", 400));
    }

    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo.path,
    });

    invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: "true",
      message: "Product created successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;

  const product = await Product.findById(id);

  if (!product) return next(new errorHandler("Product not found!", 404));

  // deleting old photo of product
  if (photo) {
    rm(product.photo!, () => {
      console.log("Old photo deleted successfully!");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product updated successfully!",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new errorHandler("Product not found!", 404));
  }

  rm(product.photo!, () => {
    console.log("Photo deleted successfully!");
  });

  await product.deleteOne();

  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully!",
  });
});

export const getReqProducts = TryCatch(
  async (req: Request<{}, {}, {}, searchRequestQuery>, res, next) => {
    const { search, category, price, sort } = req.query;

    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    // useing regex for getting similar keywords - for example
    // if we searched for an so it has to show all the products that contains "an"in their name
    // basically regex finds the pattern fo words given as request form user

    const baseQuery: BaseQuery = {};
    // category,

    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }
    if (category) {
      baseQuery.category = category;
    }

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);
    // writing query fr fetch produc twith given conditions

    const [products, filteredProductOnly] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filteredProductOnly.length / limit);
    return res.status(200).json({
      success: true,
      products,
      totalPages,
    });
  }
);

// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\65066511-62ea-4600-bf85-019b5fb60a84.jpg",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);

//     await Product.create(products);

//     console.log({ success: true });
//   }

// };
// generateRandomProducts(40)

// to delete products
// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(4);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };
// deleteRandomsProducts(90)
