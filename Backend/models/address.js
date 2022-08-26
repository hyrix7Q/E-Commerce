const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
  shippingAddress1: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: { type: String, required: true },
});

exports.Address = mongoose.model("Address", addressSchema);
