const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },
  items: {
    type: Array,
    default: [],
  },
  itemCount: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("order", OrderSchema);
