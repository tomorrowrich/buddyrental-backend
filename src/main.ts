import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';

async function bootstrap() {
  const allowedOrigins = [
    /^http:\/\/localhost:3000$/,
    /^https:\/\/mybuddyrental\.netlify\.app$/,
    /^https:\/\/*mybuddyrental\.netlify\.app$/,
  ];

  const corsOptions = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,UPDATE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
    maxAge: 86400,
  };

  const adapter = new FastifyAdapter({ logger: true });
  adapter.register(helmet);
  adapter.enableCors(corsOptions);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );
  app.setGlobalPrefix('/api');

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('BuddyRental')
      .setDescription('The renter of buddies')
      .setVersion('1.0')
      .addSecurity('bearer', {
        type: 'http',
        scheme: 'bearer',
      })
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/', app, documentFactory);
  }

  const config = app.get(ConfigService);

  await app.listen(config.getOrThrow('port'));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
