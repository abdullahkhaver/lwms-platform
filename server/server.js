import app from './src/app.js';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
dotenv.config();
const PORT = process.env.PORT || 5000;
connectDB()
    .then(() => {

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }).catch((error) => {
        console.error("Failed to connect to the database:", error.message);
        process.exit(1);
    });