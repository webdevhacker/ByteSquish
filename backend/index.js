require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const imageRoutes = require('./routes/images');
const adminRoutes = require('./routes/admin');
const mongoose = require('mongoose');
const Image = require('./models/Image');
const fs = require('fs');
const path = require('path');

mongoose.connect(process.env.DATABASE_URL).then(() => {
  console.log('Connected to MongoDB via Mongoose');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const app = express();
app.set('trust proxy', true);

app.use(cors({
  exposedHeaders: ['X-Original-Size', 'X-Compressed-Size', 'X-Total-Original-Size', 'X-Total-Compressed-Size']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Cleanup task every 1 hour (3600000 ms)
  setInterval(async () => {
    try {
      const now = new Date();
      const expiredImages = await Image.find({ expiresAt: { $lt: now } });
      
      for (const img of expiredImages) {
        const filePath = path.join(__dirname, 'uploads', img.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await Image.deleteMany({ expiresAt: { $lt: now } });
      
      if (expiredImages.length > 0) {
        console.log(`Cleaned up ${expiredImages.length} expired images.`);
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  }, 3600000);
});
