import express from 'express';
import { celebrate } from 'celebrate';
import { convertRouter } from './routes/convert';
import { uploadRouter } from './routes/upload';
import { statusRouter } from './routes/status';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/upload', uploadRouter);
app.use('/api/convert', convertRouter);
app.use('/api/status', statusRouter);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Universal File Converter API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
