import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://huzaifaali2002:asd123@cluster0.drtwxnh.mongodb.net/"
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
