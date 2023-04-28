const mongoose = require("mongoose");
const notifiScheme = mongoose.Schema(
  {
    receivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sender: { type: String, required: true },
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", notifiScheme);
module.exports = Notification;
