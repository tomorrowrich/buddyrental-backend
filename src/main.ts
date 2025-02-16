import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    cors: {
      origin: '*',
      credentials: true,
      exposedHeaders: ['Authorization', 'Content-Type'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });
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

  await app.listen(config.getOrThrow('port'), () => {
    console.log(`Listening on port ${config.getOrThrow('port')}`);
    if (process.env.NODE_ENV !== 'production') {
      void app.getUrl().then((url) => {
        console.log(`Swagger UI available at ${url}`);
      });
    }
  });
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
