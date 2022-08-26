const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress1: {
    type: String,
    required: true,
  },
  tracking: {
    Transfer: {
      Transfer: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
      },
    },
    Current: {
      Current: {
        type: String,
        default: "",
      },
      date: {
        type: Date,
      },
    },

    Arrived: {
      Arrived: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
      },
    },
  },
  shippingAddress2: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
  },
  totalPrice: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

exports.Order = mongoose.model("Order", orderSchema);
