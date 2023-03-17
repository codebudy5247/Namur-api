const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    mongoose.set("strictQuery", false);
    console.log(`Database connected!`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
