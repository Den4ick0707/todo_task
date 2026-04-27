const taskService = require('../services/task_service');

async function createTask(req, res, next) {
    try {
        const taskData = req.body;
        const newTask = await taskService.addTaskToDb(taskData);

        res.status(201).json(newTask);
    } catch (error) {
        next(error);
    }
}

async function getAllTasks(req, res, next) {
    try {
        const tasks = await taskService.getAllTasksFromDb();

        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
}
async function getTaskById(req, res, next) {
    try {
        const task = await taskService.getTaskByIdFromDb(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Not found in DB" });
        }
        res.status(200).json(task);
    } catch (error) {
        console.error("ERROR:", error);
        next(error);
    }
}

async function updateTask(req, res, next) {
    try {
        const taskId = req.params.id;
        const updateData = req.body;

        const updatedTask = await taskService.updateTaskInDb(taskId, updateData);

        if (!updatedTask) {
            return res.status(404).json({ message: "Task is not found" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
}
async function deleteTask(req, res, next) {
    try {
        const isDeleted = await taskService.deleteTaskInDb(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: `Task ${req.params.id} deleted` });
    } catch (error) {
        next(error);
    }
}
module.exports = {createTask,getAllTasks,getTaskById,updateTask,deleteTask};