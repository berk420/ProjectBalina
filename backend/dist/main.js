"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    app.use((req, res, next) => {
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
        origin: (origin, cb) => {
            cb(null, !origin || allowedOrigins.includes(origin));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Balina API')
        .setDescription('USDT Whale Transfer Notification API')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '127.0.0.1';
    await app.listen(port, host);
    console.log(`Balina API running on ${host}:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map