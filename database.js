const mongoose = require('../mockMongoose');

// Connect to MongoDB database
const connectDB = async () => {
  try {
    // MongoDB connection string (can use local MongoDB or Atlas cloud)
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
