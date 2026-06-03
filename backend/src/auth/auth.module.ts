import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module'; // User module for interacting with the database
import { EmailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from '../roles/roles.guard'; // Import RolesGuard
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    forwardRef(() => UserModule), // Circular dependency resolve
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'L@mb0rghini_2925',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [JwtModule, AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule { }
