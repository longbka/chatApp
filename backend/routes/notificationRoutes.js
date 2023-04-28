const express = require("express");
const {
  getNotifications,
  createNotification,
  updateSeenBy,
} = require("../controller/notificationController");
const { protect } = require("../middleware/authMiddlewares");
const router = express.Router();

router.route("/").post(protect, createNotification);
router.route("/").get(protect, getNotifications);
router.route("/update-seen").post(protect, updateSeenBy);
module.exports = router;
