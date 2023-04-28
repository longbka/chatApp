const express = require("express");
const router = express.Router();
const { registerUser, authUser, allUsers } = require("../controller/userControllers");
const { protect } = require("../middleware/authMiddlewares");
router.route("/").post(registerUser).get(protect,allUsers);

router.post("/login", authUser);
router.route('/')
module.exports = router;
