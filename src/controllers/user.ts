import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { newUserRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/errorHandler.js";
import errorHandler from "../utils/err-utility-class.js";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, newUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    // return next(new Error(("my error")))

    // taking signup info from user in destructured format
    // this will take error if a middleware - express.json is not used to tak json files as input
    const { name, email, photo, gender, _id, dob } = req.body;

    // if there exists data for the user it will login him/her otherwise create a new user
    // checking if user exists or not
    let user = await User.findById(_id);

    if (user) {
      return res.status(200).json({
        success: true,
        message: `Welcome ${user.name}`,
      });
    }

    // checking for any incomplete detail given by the user... if there exists some of the fields, return a error
    if (!name || !email || !photo || !gender || !_id || !dob) {
      next(new errorHandler("All entries are required!", 400));
    }

    user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    return res.status(201).json({
      success: true,
      message: `Welcome ${user.name}`,
    });
  }
);

// getting all users
export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});

  return res.status(200).json({
    success: true,
    users,
  });
});

// getting specific user (through dynamic links)
export const getUser = TryCatch(async (req, res, next) => {
  // to get the user id dynamically through link
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user) {
    return next(new errorHandler(`User with id:${id} does not exist!`, 400));
  }

  return res.status(200).json({
    success: true,
    user,
  });
});
 
export const deleteUser = TryCatch(async (req, res, next) => {
  // to get the user id dynamically through link
  const id = req.params.id;

  const user = await User.findById(id);

  if (!user) {
    return next(new errorHandler(`User with id:${id} does not exist!`, 400));
  }

  await user.deleteOne();

  return res.status(200).json({
    success: true,
    message: "User deleted Successfully!",
  });
});
