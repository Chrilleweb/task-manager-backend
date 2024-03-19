const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");

const router = express.Router();

// Middleware to check the validity of the token for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Extract the token

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Protected route for /frontpage
router.get("/frontpage", authenticateToken, (req, res) => {
  // This route is protected and requires a valid token
  res.json({ message: "Welcome to the Frontpage" });
});

router.post("/create-task", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      subTasks,
      userName,
      assignedTo,
      completed,
    } = req.body;
    const creatorUserName = req.user.userName; // Assuming you store the user ID in the token

    // Ensure that assignedTo is an array of strings
    const assignedToArray = Array.isArray(assignedTo)
      ? assignedTo
      : [assignedTo];

    // Create a new task document
    const newTask = new Task({
      title,
      description,
      dueDate,
      subTasks,
      userName, // Assuming this is the username of the task creator
      assignedTo: assignedToArray,
      allowedUsers: [creatorUserName, ...assignedToArray], // Include the task creator in allowedUsers
      userId: creatorUserName, // Assuming you store the user ID as userName
      completed,
    });

    // Save the task to the database
    await newTask.save();

    res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/view-tasks", authenticateToken, async (req, res) => {
  try {
    const userName = req.user.userName; // Assuming you store the user ID in the token
    // Retrieve all tasks for the user
    const tasks = await Task.find({ allowedUsers: userName });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/view-task/:id", authenticateToken, async (req, res) => {
  try {
    const userName = req.user.userName; // Assuming you store the user ID in the token
    const taskId = req.params.id;

    // Retrieve the task by ID
    const task = await Task.findOne({ _id: taskId, allowedUsers: userName });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error("Error retrieving task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/edit-task/:id", authenticateToken, async (req, res) => {
  try {
    const userName = req.user.userName; // Assuming you store the user ID in the token
    const taskId = req.params.id;
    const { title, description, dueDate, subTasks, assignedTo, completed } =
      req.body;

    // Retrieve the task by ID
    const task = await Task.findOne({ _id: taskId, allowedUsers: userName });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task fields
    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    task.subTasks = subTasks;
    task.assignedTo = assignedTo;
    task.completed = completed;

    // Save the updated task
    await task.save();

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/complete-task/:id", authenticateToken, async (req, res) => {
  try {
    const userName = req.user.userName; // Assuming you store the user ID in the token
    const taskId = req.params.id;
    const { completed } = req.body; // Get the completion status from the request body

    // Retrieve the task by ID
    const task = await Task.findOne({ _id: taskId, allowedUsers: userName });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task's completed field based on the request body
    task.completed = completed;

    // Save the updated task
    await task.save();

    res.status(200).json({ message: "Task completion status updated successfully" });
  } catch (error) {
    console.error("Error updating task completion status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/complete-subtask/:taskId/:subTaskId", authenticateToken, async (req, res) => {
  try {
    const userName = req.user.userName; // Assuming you store the user ID in the token
    const taskId = req.params.taskId;
    const subTaskId = req.params.subTaskId;

    // Retrieve the task by ID
    const task = await Task.findOne({ _id: taskId, allowedUsers: userName });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the subtask by ID
    const subTask = task.subTasks.id(subTaskId);

    if (!subTask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Update the subtask's completed field
    subTask.completed = !subTask.completed;

    // Save the updated task
    await task.save();

    res.status(200).json({ message: "Subtask completion status updated successfully" });
  } catch (error) {
    console.error("Error updating subtask completion status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.delete("/delete-task/:id", authenticateToken, async (req, res) => {
  try {
    const userName = req.user.userName; // Assuming you store the user ID in the token
    const taskId = req.params.id;

    // Delete the task by ID
    const result = await Task.deleteOne({
      _id: taskId,
      allowedUsers: userName,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// dropdown seach for users to assign task to
router.get("/search-users", authenticateToken, async (req, res) => {
  try {
    const userName = req.user.userName;
    
    const users = await Task.aggregate([
      { $match: { userName: { $ne: userName } } },
      { $group: { _id: "$userName" } },
      { $project: { _id: 0, userName: "$_id" } },
    ]);

    res.status(200).json(users.map(user => user.userName));
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// You can add more protected routes here

module.exports = router;