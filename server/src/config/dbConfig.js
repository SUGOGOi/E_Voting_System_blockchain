import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(
      `${process.env.MONGO_ONLINE}`
    );
    console.log(`Mongodb connected ${connection.host}`);
  } catch (error) {
    console.log(error);
  }
};
