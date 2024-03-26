const express = require("express");
const router = express.Router();
const taskController = require("../controller/taskController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/frontpage", authenticateToken.authenticateToken, taskController.frontpage_get);
router.post("/create-task", authenticateToken.authenticateToken, taskController.create_task_post);
router.get("/view-tasks", authenticateToken.authenticateToken, taskController.view_task_get);
router.get("/view-task/:id", authenticateToken.authenticateToken, taskController.view_task_id_get);
router.put("/edit-task/:id", authenticateToken.authenticateToken, taskController.edit_task_id_put);
router.patch("complete-task:id", authenticateToken.authenticateToken, taskController.complete_task_id_patch);
router.patch("/complete-subtask/:taskId/:subTaskId", authenticateToken.authenticateToken, taskController.complete_subtask_taskId_id_patch);
router.delete("/delete-task/:id", authenticateToken.authenticateToken, taskController.delete_task_id_delete);
router.get("/search-users", authenticateToken.authenticateToken, taskController.search_users_get);

module.exports = router;