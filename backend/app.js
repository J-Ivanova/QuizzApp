import express from 'express';
import cors from 'cors';
import generateRoute from './routes/generateRoute.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/generate-questions', generateRoute);

export default app;