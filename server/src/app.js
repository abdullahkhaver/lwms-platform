import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
//routes
import authRoutes from './routes/auth.routes.js';
import complaintRoutes from './routes/complaint.routes.js';


const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(helmet());
app.use(express.json());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window`
	message: "Too many requests, please try again later.",
	statusCode: 429,
});

app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;