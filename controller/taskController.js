const Task = require("../models/Task");

const frontpage_get = (req, res) => {
  res.json({ message: "Welcome to the Frontpage" });
};

const create_task_post = async (req, res) => {
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
    const creatorUserName = req.user.userName;

    const assignedToArray = Array.isArray(assignedTo)
      ? assignedTo
      : [assignedTo];

    const newTask = new Task({
      title,
      description,
      dueDate,
      subTasks,
      userName,
      assignedTo: assignedToArray,
      allowedUsers: [creatorUserName, ...assignedToArray],
      userId: creatorUserName,
      completed,
    });

    // Save the task to the database
    await newTask.save();

    res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const view_task_get = async (req, res) => {
  try {
    const userName = req.user.userName;
    // Retrieve all tasks for the user
    const tasks = await Task.find({ allowedUsers: userName });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const view_task_id_get = async (req, res) => {
  try {
    const userName = req.user.userName;
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
};

const edit_task_id_put = async (req, res) => {
  try {
    const userName = req.user.userName;
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
};

const complete_task_id_patch = async (req, res) => {
  try {
    const userName = req.user.userName;
    const taskId = req.params.id;
    const { completed } = req.body;

    // Retrieve the task by ID
    const task = await Task.findOne({ _id: taskId, allowedUsers: userName });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task's completed field based on the request body
    task.completed = completed;

    // Save the updated task
    await task.save();

    res
      .status(200)
      .json({ message: "Task completion status updated successfully" });
  } catch (error) {
    console.error("Error updating task completion status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const complete_subtask_taskId_id_patch = async (req, res) => {
  try {
    const userName = req.user.userName;
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

    res
      .status(200)
      .json({ message: "Subtask completion status updated successfully" });
  } catch (error) {
    console.error("Error updating subtask completion status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const delete_task_id_delete = async (req, res) => {
  try {
    const userName = req.user.userName;
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
};

// dropdown seach for users to assign task to
const search_users_get = async (req, res) => {
  try {
    const userName = req.user.userName;

    const users = await Task.aggregate([
      { $match: { userName: { $ne: userName } } },
      { $group: { _id: "$userName" } },
      { $project: { _id: 0, userName: "$_id" } },
    ]);

    res.status(200).json(users.map((user) => user.userName));
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  frontpage_get,
  create_task_post,
  view_task_get,
  view_task_id_get,
  edit_task_id_put,
  complete_task_id_patch,
  complete_subtask_taskId_id_patch,
  delete_task_id_delete,
  search_users_get,
};
