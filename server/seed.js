import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminExists = await User.findOne({ email: 'admin@lwms.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@lwms.com',
        phone: '1234567890',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created');
    } else {
      console.log('Admin already exists');
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();