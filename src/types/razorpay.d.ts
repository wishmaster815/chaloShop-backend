declare module "razorpay" {
  interface RazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    payment_capture?: number;
    notes?: Record<string, string>;
  }

  interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    created_at: number;
  }

  interface RazorpayInstance {
    orders: {
      create(options: RazorpayOrderOptions): Promise<RazorpayOrder>;
    };
  }

  const Razorpay: new (options: {
    key_id: string;
    key_secret: string;
  }) => RazorpayInstance;

  export default Razorpay;
}
