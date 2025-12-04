import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // no extra options

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("DB Error: ", error.message);
    process.exit(1);
  }
};

export default connectDB;
