const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup
} = require("../controller/chatController");
const { protect } = require("../middleware/authMiddlewares");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/group_add").post(protect, addToGroup);
router.route("/group_remove").post(protect,removeFromGroup)
module.exports = router;
