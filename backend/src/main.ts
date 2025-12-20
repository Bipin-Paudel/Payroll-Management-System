import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // ✅ Disable default CORS first to avoid conflicts
  const app = await NestFactory.create(AppModule, { cors: false });

  // ✅ Prefix all routes with /api (frontend should use /api/auth/...)
  app.setGlobalPrefix('api');

  // ✅ CORS Configuration for Next.js frontend on port 3000
  app.enableCors({
    origin: [
      'http://localhost:3000', // your Next.js dev server
      'http://127.0.0.1:3000', // also allow this variant
    ],
    credentials: true, // allow headers to include Authorization
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
      "X-Requested-With",
      "x-company-id",
    ],
  });

  await app.listen(3333, '0.0.0.0');
  console.log('🚀 Server running at http://localhost:3333');
}

bootstrap();
