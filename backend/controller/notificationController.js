const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

//Lấy tất cả các thông báo của 1 người
const getNotifications = asyncHandler(async (req, res) => {
  try {
    await Notification.find({
      receivers: req.user._id.toString(),
      seenBy: {
        $ne: req.user._id,
      },
    })
      .populate("message")
      .sort({ updateAt: -1 })
      .then(async (results) => {
        await Message.populate(results, {
          path: "message.chat",
          select: "chatName users lastestMessage isGroupChat _id",
        });
        await Message.populate(results, {
          path: "message.sender",
          select: "name",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const createNotification = asyncHandler(async (req, res) => {
  const { message, receivers, sender } = req.body;
  console.log("message", message);
  try {
    const checkNotificationExist = await Notification.findOne({
      message: message,
    });
    console.log("check", checkNotificationExist);
    if (checkNotificationExist) {
      return;
    }
    const createdNotification = await Notification.create({
      message,
      receivers: JSON.parse(receivers),
      sender,
    });
    const notification = await Notification.findOne({
      _id: createdNotification._id,
    })
      .populate("sender", "-password")
      .populate("receivers", "-password")
      .then(async (results) => {
        console.log("res", results);
        res.status(200).send(results);
      });
  } catch (error) {
    console.log("err", error);
    res.status(400);
    throw new Error(error.message);
  }
});
const updateSeenBy = asyncHandler(async (req, res) => {
  const { seenBy, chatId } = req.body;
  console.log("seenBy", seenBy);
  console.log("chatId", chatId);
  const isSeenBy = await Notification.updateMany(
    { chat: chatId },
    {
      $addToSet: { seenBy: seenBy },
    },
    {
      new: true,
    }
  );
  if (!isSeenBy) {
    res.status(404);
    throw new Error("Notification Not Found");
  } else {
    res.json(isSeenBy);
  }
});
module.exports = {
  getNotifications,
  createNotification,
  updateSeenBy,
};
