import { NextFunction, Request, Response } from "express";

export interface newUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}
export interface newProductRequestBody {
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface newCouponRequestBody {
  coupon: string;
  amount: number;
}

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type searchRequestQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export interface BaseQuery {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: { $lte: number };
  category?: string;
}

export type invalidateCacheProps = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string | string[];
};

export type shippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
};

export type orderItemsType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
};

export interface newOrderRequestBody {
  shippingInfo: shippingInfoType;
  user: string;
  subtotal: number;
  tax: number;
  discount: number;
  shippingCharges: number;
  total: number;
  status: string;
  orderItems: orderItemsType[];
}
