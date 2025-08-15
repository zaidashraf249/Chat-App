import mongoose from "mongoose";

// Function to connect to the MongoDB database
const ConnectDB = async () => {
  try {
    // Log a message when the connection is successfully established
    mongoose.connection.on('connected', () => {
      console.log('Database connected successfully...!');
    });

    // Attempt to connect using the MONGODB_URI and the 'chat-app' database
    await mongoose.connect(`${process.env.MONGO_URI}/chat-app`);

  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export default ConnectDB;
