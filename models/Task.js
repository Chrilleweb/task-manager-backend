const mongoose = require("mongoose");

const subTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: false,
  },
  subTasks: {
    type: [subTaskSchema], // Use the subTaskSchema for the array of subtasks
    default: [],
  },
  userName: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: [String],
    default: [],
  },
  allowedUsers: {
    type: [String],
    required: true,
    default: [],
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
