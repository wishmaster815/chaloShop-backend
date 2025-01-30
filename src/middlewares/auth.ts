// middleware to make sure only admin has the access to make changes

import { User } from "../models/user.js";
import errorHandler from "../utils/err-utility-class.js";
import { TryCatch } from "./errorHandler.js";

export const adminOnly = TryCatch(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new errorHandler("Empty field!", 401));

  const user = await User.findById(id);
  if (!user) return next(new errorHandler("Enter valid id!", 401));

  if (user.role != "admin")
    return next(new errorHandler("Not authorised to access!", 401));

  next();
});
