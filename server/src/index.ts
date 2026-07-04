import express from 'express';
import convertRouter from './routes/convert';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Routes
app.use('/api', convertRouter);

// Health check & system info
app.get('/api/status', (_req, res) => {
  const { execSync } = require('child_process');
  const check = (name: string) => {
    try { execSync(`which ${name}`, { stdio: 'pipe' }); return true; } catch { return false; }
  };
  res.json({
    status: 'ok',
    version: '1.0.0',
    tools: {
      ghostscript: check('gs'),
      ffmpeg: check('ffmpeg'),
      pandoc: check('pandoc'),
      imagemagick: check('convert'),
    },
  });
});

// Root
app.get('/', (_req, res) => {
  res.json({ message: 'PixelForge Universal File Converter API', version: '1.0.0' });
});

app.listen(port, () => {
  console.log(`PixelForge server running on http://localhost:${port}`);
});
