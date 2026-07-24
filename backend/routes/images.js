const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Image = require('../models/Image');
const { optionalAuth, authenticateToken } = require('../middlewares/auth');

const router = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } 
});

router.post('/compress', optionalAuth, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const maxUploads = req.user ? 20 : 10;
    if (req.files.length > maxUploads) {
      return res.status(403).json({ 
        error: `Upload limit exceeded. Guests can upload up to 10 images. Please login to upload up to 20 images.` 
      });
    }

    const quality = parseInt(req.body.quality, 10) || 80;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Process all images
    const processedImages = await Promise.all(
      req.files.map(async (file) => {
        let compressedBuffer;
        const originalName = file.originalname;
        const format = file.mimetype.split('/')[1];

        // Basic compression using Sharp
        if (['jpeg', 'jpg', 'png', 'webp', 'avif', 'tiff'].includes(format)) {
          try {
            let transformer = sharp(file.buffer);
            
            if (format === 'jpeg' || format === 'jpg') {
              transformer = transformer.jpeg({ quality });
            } else if (format === 'png') {
              transformer = transformer.png({ quality });
            } else if (format === 'webp') {
              transformer = transformer.webp({ quality });
            } else if (format === 'avif') {
              transformer = transformer.avif({ quality });
            } else if (format === 'tiff') {
              transformer = transformer.tiff({ quality });
            }

            compressedBuffer = await transformer.toBuffer();
          } catch (imgError) {
            console.error(`Error processing image ${originalName}:`, imgError);
            compressedBuffer = file.buffer; // fallback to original
          }
        } else {
          compressedBuffer = file.buffer;
        }

        const compressedSize = compressedBuffer.length;
        
        let dbImage = null;
        if (req.user) {
          const fileName = `${uuidv4()}-${originalName}`;
          const filePath = path.join(uploadsDir, fileName);
          fs.writeFileSync(filePath, compressedBuffer);
          
          dbImage = await Image.create({
            userId: req.user.userId,
            originalName,
            fileName,
            originalSize: file.size,
            compressedSize,
            expiresAt
          });
        }

        return {
          name: originalName,
          buffer: compressedBuffer,
          originalSize: file.size,
          compressedSize,
          dbImage
        };
      })
    );

    if (processedImages.length === 1) {
      const img = processedImages[0];
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="compressed_${img.name}"`);
      res.setHeader('X-Original-Size', img.originalSize);
      res.setHeader('X-Compressed-Size', img.compressedSize);
      return res.send(img.buffer);
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="compressed_images.zip"');
    
    const totalOriginalSize = processedImages.reduce((sum, img) => sum + img.originalSize, 0);
    const totalCompressedSize = processedImages.reduce((sum, img) => sum + img.compressedSize, 0);
    res.setHeader('X-Total-Original-Size', totalOriginalSize);
    res.setHeader('X-Total-Compressed-Size', totalCompressedSize);

    if (req.query.zip === 'false') {
      res.setHeader('X-Total-Original-Size', totalOriginalSize);
      res.setHeader('X-Total-Compressed-Size', totalCompressedSize);
      return res.json({
        totalOriginalSize,
        totalCompressedSize,
        images: processedImages.map(img => ({
          name: img.name,
          originalSize: img.originalSize,
          compressedSize: img.compressedSize,
          base64: img.buffer.toString('base64'),
          mimeType: `image/${img.name.split('.').pop().toLowerCase() === 'jpg' ? 'jpeg' : img.name.split('.').pop().toLowerCase()}`
        }))
      });
    }

    const zip = new AdmZip();
    processedImages.forEach(img => {
      zip.addFile(img.name, img.buffer);
    });

    return res.send(zip.toBuffer());

  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: 'Failed to compress images' });
  }
});

// Get user's image history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const images = await Image.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility
    res.json(images.map(img => ({ ...img.toObject(), id: img._id })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Download a specific historical image
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image || image.userId.toString() !== req.user.userId.toString()) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const filePath = path.join(uploadsDir, image.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File no longer exists on disk' });
    }

    res.download(filePath, image.originalName);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download image' });
  }
});

// Delete a specific image
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image || image.userId.toString() !== req.user.userId.toString()) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const filePath = path.join(uploadsDir, image.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.deleteOne({ _id: image._id });

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
