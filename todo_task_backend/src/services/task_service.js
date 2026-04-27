const {getCollection} = require('../config/MongoDBContext');
const ObjectId = require('mongodb').ObjectId;
const TaskModel = require('../models/task_model');

async function addTaskToDb(taskData) {
    const collection = await getCollection('task_list');

    const taskToSave = new TaskModel.constructor(taskData);
    const result = await collection.insertOne(taskToSave);

    return {_id: result.insertedId, ...taskToSave};
}

async function getAllTasksFromDb() {
    const collection = await getCollection('task_list');
    return await collection.find({}).toArray();
}


async function getTaskByIdFromDb(targetId) {
    console.log("Шукаємо ID:", targetId);
    const collection = await getCollection('task_list');

    // Спробуй вивести сконструйований об'єкт
    const query = { _id: new ObjectId(targetId.trim()) }; // trim() прибере випадкові пробіли
    console.log("Запит до бази:", query);

    const result_task = await collection.findOne(query);
    console.log("Результат з бази:", result_task);

    return result_task;
}

async function updateTaskInDb(id, updateInfo) {
    try {
        if (!ObjectId.isValid(id)) return null;

        const collection = await getCollection('task_list');

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateInfo },
            { returnDocument: 'after' }
        );

        return result;
    } catch (err) {
        throw err;
    }
}

async function deleteTaskInDb(id) {
    const collection = await getCollection('task_list');
    const result = await collection.deleteOne({_id: new ObjectId(id)});
    return result.deletedCount > 0;
}

module.exports = {addTaskToDb, getAllTasksFromDb, getTaskByIdFromDb, updateTaskInDb, deleteTaskInDb};