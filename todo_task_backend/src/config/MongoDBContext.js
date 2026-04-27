const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDb setting
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 50000,
    connectTimeoutMS: 10000,
    family: 4
});



let dbInstance = null;
let connectionPromise = null;

async function connectToDB(retries=5) {
    if (dbInstance) return dbInstance;

    while (retries) {
        try {
            await client.connect();
            dbInstance = client.db(process.env.DB_NAME || 'todo_db');
            console.log('Successfully connected to MongoDB!');
            return dbInstance;
        } catch (error) {
            retries -= 1;
            console.log(`Connection failed. Retries left: ${retries}`);
            if (retries === 0) {
                console.error('CRITICAL ERROR: Could not connect to database after several attempts');
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, 2000));
        }
    }
}

async function getCollection(name) {
    const db = await connectToDB();
    return db.collection(name);
}

module.exports = { getCollection, connectToDB };