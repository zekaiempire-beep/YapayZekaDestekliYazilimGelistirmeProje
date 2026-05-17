import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from './entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Seed admin user
  try {
    const dataSource = app.get(DataSource);
    const userRepository = dataSource.getRepository('User');
    
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@test.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const adminUser = userRepository.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      });

      await userRepository.save(adminUser);
      console.log('✓ Admin user seeded successfully (admin@test.com / password123)');
    } else {
      console.log('✓ Admin user already exists');
    }
  } catch (error) {
    console.log('Seed error (non-critical):', error.message);
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
}

bootstrap();
