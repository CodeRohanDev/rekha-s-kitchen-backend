require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

// Test Firebase connection on startup
const testFirebaseConnection = async () => {
  try {
    const { db } = require('./src/config/database');
    
    // Test Firestore connection
    await db.collection('_health_check').add({
      message: 'Server started successfully',
      timestamp: new Date()
    });
    
    logger.info('✅ Firebase Firestore connected successfully');
    
    // Clean up test document
    const snapshot = await db.collection('_health_check').get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
  } catch (error) {
    logger.error('❌ Firebase connection failed:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Test Firebase connection
    await testFirebaseConnection();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Rekha's Kitchen API server running on port ${PORT}`);
      logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();