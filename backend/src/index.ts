import 'dotenv/config';
import app from './app';
import { logger } from './config/logger';
import { prisma } from './database/client';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api/docs`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
