import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document { 
    _id:string;
    name: string;
    photo:string;
    gender: "male"| "female";
    dob: Date;
    email:string;
    role:"admin"|"user";
    createdAt: Date;
    updatedAt: Date;

    // virtual attribute
    age: number;
}

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please enter id!"],
    },
    name: {
      type: String,
      required: [true, "Please enter name!"],
    },
    photo: {
      type: String,
      required: [true, "Please enter photo!"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please enter gender!"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter date of birth!"],
    },
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Please enter gender!"],
      validate: validator.default.isEmail,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

// adding virtual attribute ( for calcultaing age using DOB)
schema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob;
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() < dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
});

export const User = mongoose.model<IUser>("User", schema);


