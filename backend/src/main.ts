import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use((req: any, res: any, next: any) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:8085',
    'http://localhost:8086',
    'https://balina.testprocess.com.tr',
    'https://balinaapi.testprocess.com.tr',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin: any, cb: any) => {
      cb(null, !origin || allowedOrigins.includes(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Balina API')
    .setDescription('USDT Whale Transfer Notification API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '127.0.0.1';
  await app.listen(port, host);
  console.log(`Balina API running on ${host}:${port}`);
}
bootstrap();
