const express = require("express");
const router = express.Router();
const loginRegisterController = require("../controller/loginRegisterController");

router.post("/signup", loginRegisterController.register_post);
router.post("/login", loginRegisterController.login_post);

module.exports = router;
