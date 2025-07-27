import mongoose from 'mongoose';

//const mongoose = require("mongoose");

const orderDetailsSchema = new mongoose.Schema({
  orderId: String,
  startDate: Date,
  endDate: Date,
  customer: {
    fullName: String,
    email: String,
    phone: String,
  },
  shipping: {
    method: String,
    address: String,
  },
  payment: {
    method: String,
    cardLast4: String,
    businessName: String,
    phone: String,
  },
  status: String,
  products: [
    {
      productName: String,
      orderID: String,
      quantity: Number,
      total: Number,
    },
  ],
  note: String,
});

const OrderDetails = mongoose.model("OrderDetails", orderDetailsSchema);
export default OrderDetails;