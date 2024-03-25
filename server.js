require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const loginRegisterRoutes = require("./routes/loginRegister");
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT
app.use(cors());

const uri = process.env.MONGO_URL;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

// Use the body-parser middleware to parse JSON
app.use(express.json());

// Include the authentication routes
app.use(loginRegisterRoutes);
app.use("/auth", authRoutes);

// Define a route for the root URL
app.get("/", () => {});

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Do not disconnect here if you want to maintain the connection
  }
}

// Your other routes and middleware setup code here

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Call the run function to establish the MongoDB connection
run().catch(console.dir);

module.exports = server; // for testing