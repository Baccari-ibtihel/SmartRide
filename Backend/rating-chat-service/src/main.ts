import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get } from '@nestjs/common';

@Controller('api/rating-chat')
class AppController {
  @Get('health')
  getHealth() {
    return { status: 'UP', service: 'Rating/Chat Service (NestJS)' };
  }
}

@Module({
  controllers: [AppController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8085);
  console.log('Rating/Chat Service (NestJS) running on port 8085');
}
bootstrap();
