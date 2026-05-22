import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import * as path from "path";
import * as fs from "fs";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Auth routes
app.use('/api/v1/auth', authRoutes);

// 静态文件服务 - 前端页面
const publicPath = path.join(process.cwd(), '../client/public');
app.use(express.static(publicPath));

// 首页
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 所有HTML页面都走同一个路由
app.get('*.html', (req, res) => {
  const filePath = path.join(publicPath, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Page not found');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
