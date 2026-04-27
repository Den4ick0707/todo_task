const ObjectId = require("mongodb").ObjectId;

class TaskModel {
    _id; // ObjectId
    title;
    description;
    created_at;
    status;

    constructor(data) {
        this.title = data.title;
        this.description = data.description;
        this.status = data.status || 'pending';
        this.created_at = new Date();
    }
}


