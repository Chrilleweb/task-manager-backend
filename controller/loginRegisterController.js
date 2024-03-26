const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register_post = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login_post = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create and sign a JWT using the secret key from environment variable
    const token = jwt.sign(
      { userId: user._id, userName: user.username },
      process.env.JWT_SECRET,
    );

    res.json({ token });
  } catch (error) {
    console.error("Login failed: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  register_post,
  login_post,
};
