const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log(`MongoDB connected: ${mongoose.connection.host}`.bgGreen.white);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error}`.bgRed.white);
  }
};

module.exports = connectDB;
