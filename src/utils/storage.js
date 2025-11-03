const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class StorageUtils {
  /**
   * Upload file to Cloudinary
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - File name
   * @param {string} folder - Folder path (e.g., 'banners', 'menu-items')
   * @param {string} contentType - MIME type
   * @returns {Promise<string>} - Public URL of uploaded file
   */
  static async uploadFile(fileBuffer, fileName, folder = 'uploads', contentType = 'image/jpeg') {
    try {
      // Convert buffer to base64
      const fileStr = `data:${contentType};base64,${fileBuffer.toString('base64')}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(fileStr, {
        folder: `rekhas-kitchen/${folder}`,
        resource_type: 'auto',
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`,
        overwrite: false
      });

      logger.info('File uploaded successfully to Cloudinary', { 
        fileName, 
        url: result.secure_url,
        publicId: result.public_id
      });

      return result.secure_url;
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete file from Cloudinary
   * @param {string} fileUrl - Public URL of the file
   * @returns {Promise<boolean>}
   */
  static async deleteFile(fileUrl) {
    try {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/filename.jpg
      const urlParts = fileUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      
      if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
        throw new Error('Invalid Cloudinary URL');
      }

      // Get everything after 'upload/v123456/'
      const pathParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
      const publicId = pathParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension

      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        logger.info('File deleted successfully from Cloudinary', { publicId });
        return true;
      } else {
        logger.warn('File not found in Cloudinary', { publicId, result });
        return false;
      }
    } catch (error) {
      logger.error('Cloudinary deletion error:', error);
      return false;
    }
  }

  /**
   * Get file metadata from Cloudinary
   * @param {string} fileUrl - Public URL of the file
   * @returns {Promise<object>}
   */
  static async getFileMetadata(fileUrl) {
    try {
      // Extract public_id from URL
      const urlParts = fileUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      const pathParts = urlParts.slice(uploadIndex + 2);
      const publicId = pathParts.join('/').replace(/\.[^/.]+$/, '');

      // Get resource details from Cloudinary
      const result = await cloudinary.api.resource(publicId);
      
      return {
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at
      };
    } catch (error) {
      logger.error('Get Cloudinary metadata error:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Validate image file
   * @param {object} file - Multer file object
   * @returns {object} - { valid: boolean, error: string }
   */
  static validateImageFile(file) {
    // Check if file exists
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' };
    }

    return { valid: true };
  }

  /**
   * Get file extension from mimetype
   * @param {string} mimetype
   * @returns {string}
   */
  static getFileExtension(mimetype) {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    return extensions[mimetype] || 'jpg';
  }
}

module.exports = StorageUtils;
