import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule), // Circular dependency resolve
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService, JwtAuthGuard],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
