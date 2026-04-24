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

  app.getHttpAdapter().get('/firebase-messaging-sw.js', (_req: any, res: any) => {
    const config = {
      apiKey: process.env.FIREBASE_CLIENT_API_KEY ?? '',
      authDomain: process.env.FIREBASE_CLIENT_AUTH_DOMAIN ?? '',
      projectId: process.env.FIREBASE_PROJECT_ID ?? '',
      storageBucket: process.env.FIREBASE_CLIENT_STORAGE_BUCKET ?? '',
      messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID ?? '',
      appId: process.env.FIREBASE_CLIENT_APP_ID ?? '',
    };
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.send(`
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const data = payload.data || {};
  self.registration.showNotification(title || '🐳 Balina Transfer!', {
    body: body || (data.amountFormatted + ' USDT'),
    icon: '/icon.png',
    tag: 'whale-' + (data.txHash || Date.now()),
    data: { url: data.txHash ? 'https://etherscan.io/tx/' + data.txHash : '/' },
  });
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});
`);
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Balina API running on port ${port}`);
}
bootstrap();
