import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
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

// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

export default app;