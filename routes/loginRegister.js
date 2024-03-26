const express = require("express");
const router = express.Router();
const loginSignupController = require("../controller/loginSignupController");

router.post("/signup", loginSignupController.register_post);
router.post("/login", loginSignupController.login_post);

module.exports = router;
