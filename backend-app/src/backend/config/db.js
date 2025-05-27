// connect backend to MongoDB

//import mongoose library, this is how we interact with MongoDB
const mongoose = require('mongoose');

//declares an synchronous function connectDB that attempts to connect to MongoDB
const connectDB = async () => {
    try {
        //calls mongoose.connect() with the connection string stored in .env file as MONGO_URI
        //wait until the connection is successful or throws an error
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            //new MongoDB drivers
            useNewUrlParser: true, //ensures the use of the new URL string parser
            useUnifiedTopology: true, //uses the latest server discovery and monitoring engine
            // Optional: useCreateIndex and useFindAndModify are deprecated in Mongoose 6+
        });

        //if connection is successful, log the host
        console.log(`MongoDB connected: ${conn.connection.host}`);
        //if there is an error, log the error message, stops the entire app using exit to prevent the server from starting without a DB connection
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1); // Exit with failure
    }
};

//export function so that it can be called from another file(server.js)
module.exports = connectDB;
