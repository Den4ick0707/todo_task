const express = require('express')
const app = express()
const task_router = express.Router()
const taskController = require('../controllers/task_controller')
const {getTaskById} = require("../controllers/task_controller");


/**
 * @swagger
 *  /tasks:
 *    get:
 *      summary: Get all tasks
 *      tags: [Tasks]
 *      responses:
 *        200:
 *          description: Successful get all tasks
 *        404:
 *          description: Not found tasks
 *        content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    title:
 *                      type: string
 *                    description:
 *                      type: string
 *                    status:
 *                      type: string
 *                    created_at:
 *                      type: string
 *                      format: date-time
 */
task_router.get('/', taskController.getAllTasks)


/**
 * @swagger
 *   /tasks:
 *    post:
 *      summary: Create new task
 *      tags: [Tasks]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                  example: ""
 *                description:
 *                  type: string
 *                  example: ""
 *                status:
 *                  type: string
 *                  example: ""
 *      responses:
 *        201:
 *          description: Task create!
 *        400:
 *          description: Invalid input data
 */
task_router.post('/', taskController.createTask)


/**
 * @swagger
 *  /tasks/{id}:
 *    put:
 *      summary: Update exist task
 *      tags: [Tasks]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: Task Id
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                description:
 *                  type: string
 *                status:
 *                  type: string
 *      responses:
 *        200:
 *          description: Task updated
 *        404:
 *          description: Task with Id not found
 *        400:
 *          description: Invalid Id or data
 */
task_router.put('/:id', taskController.updateTask);


/**
 * @swagger
 *  /tasks/{id}:
 *    delete:
 *      summary: Delete task by Id
 *      tags: [Tasks]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: Task Id
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Task was deleted
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Завдання успішно видалено"
 *        404:
 *          description: Task not found
 *        500:
 *          description: Server error
 */
task_router.delete('/:id', taskController.deleteTask);


/**
 * @swagger
 *  /tasks/{id}:
 *    get:
 *      summary: Get task by ID
 *      tags: [Tasks]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: Task Id
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  title:
 *                    type: string
 *                  description:
 *                    type: string
 *                  status:
 *                    type: string
 *                  created_at:
 *                    type: string
 *                    format: date-time
 *        404:
 *          description: Task not found
 */
task_router.get('/:id', taskController.getTaskById  )



module.exports = task_router;