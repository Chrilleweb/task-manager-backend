require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const loginRegisterRoutes = require("./routes/loginRegister");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());

// Use the body-parser middleware to parse JSON
app.use(express.json());

// Include the authentication routes
app.use(loginRegisterRoutes);
app.use("/auth", taskRoutes);

// MongoDB connection
async function connectToMongoDB() {
  try {
    const uri = process.env.MONGO_URL;
    const clientOptions = {
      serverApi: { version: "1", strict: true, deprecationErrors: true },
    };
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return false;
  }
}

// Start server
async function startServer() {
  try {
    const connected = await connectToMongoDB();
    if (!connected) {
      throw new Error("Failed to connect to MongoDB. Server cannot start.");
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

// Call startServer to initiate server startup
startServer();

module.exports = app; // for testing