import mongoose from "mongoose";
import { seedGrades } from "../utils/seedGrades.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Files DB connected");
    await seedGrades();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
