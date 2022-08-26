const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notificationType: {
    type: String,
    required: false,
  },
  message: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now(),
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  seen: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  street: {
    type: String,
    default: "",
  },
  notifications: [notificationSchema],
  apartment: {
    type: String,
    default: "",
  },
  zip: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
});

exports.User = mongoose.model("User", userSchema);
exports.Notification = mongoose.model("Notification", notificationSchema);
