import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // process.env.MONGODB_URI me tumhara MongoDB ka link hona chahiye (.env file me)
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database Connected Successfully! 🟢");
    } catch (error) {
        console.log("Database connection failed 🔴", error);
    }
};

export default connectDB;