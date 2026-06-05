// import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcryptjs';
// import { UserService } from '../user/user.service';
// import { JwtPayload } from './jwt-payload.interface';
// import { User } from '../user/user.entity';
// import { compare } from 'bcrypt';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly usersService: UserService,
//     private readonly jwtService: JwtService,
//   ) {}

//   // Login method
//   async login(email: string, password: string) {
//     console.log("Received email:", email);
//     const user = await this.usersService.findOneByEmail(email);
    
//     if (!user) {
//         console.error("User not found for email:", email);
//         throw new HttpException('User not found', HttpStatus.NOT_FOUND);
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//         console.error("Invalid password for email:", email); 
//         throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
//     }

//     const payload: JwtPayload = { username: user.username, email: user.email, role: user.role, id: user.id };
//     const accessToken = this.jwtService.sign(payload);
//     console.log('Generated Token:', accessToken); // Log the generated token

//     return { token: accessToken };
//   }

//   // Signup method
//   async signup(username: string, email: string, password: string) {
//     const existingUser = await this.usersService.findOneByEmail(email);
//     if (existingUser) {
//       throw new Error('User already exists');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User();
//     user.username = username;
//     user.email = email;
//     user.password = hashedPassword;
//     user.role = 'user'; 
//     await this.usersService.create(user);
//     return { message: 'User successfully created' };
//   }
// }
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { JwtPayload } from './jwt-payload.interface';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  private signAccessToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'L@mb0rghini_2925',
      expiresIn: '7d',
    });
  }

  private signRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'L@mb0rghini_2925_refresh',
      expiresIn: '7d',
    });
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    const payload: JwtPayload = {
      username: user.username,
      email: user.email,
      role: user.role,
      id: user.id,
    };
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);
    const refreshTokenHash = await this.hashToken(refreshToken);

    await this.usersService.setRefreshTokenHash(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      role: user.role,
      username: user.username,
      userId: user.id,
    };
  }

  async signup(username: string, email: string, password: string) {
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.username = username;
    user.email = email.toLowerCase().trim();
    user.password = hashedPassword;
    user.role = 'user';

    const createdUser = await this.usersService.create(user);
    
    // Send confirmation email
    try {
      const confirmationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?userId=${createdUser.id}`;
      await this.emailService.sendConfirmationEmail(email, username, confirmationLink);
    } catch (error) {
      console.warn('Failed to send confirmation email:', error);
      // Don't fail the signup if email fails to send
    }

    return { 
      message: 'User successfully created. Please check your email to confirm your account.' 
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'L@mb0rghini_2925_refresh',
      });

      const user = await this.usersService.findOneById(payload.id);
      if (!user || !user.refreshTokenHash) {
        throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!isValid) {
        throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
      }

      const newAccessToken = this.signAccessToken(payload);
      const newRefreshToken = this.signRefreshToken(payload);
      const newRefreshTokenHash = await this.hashToken(newRefreshToken);

      await this.usersService.setRefreshTokenHash(user.id, newRefreshTokenHash);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  async logout(userId: number) {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { message: 'Logged out' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Current password is incorrect', HttpStatus.UNAUTHORIZED);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return { message: 'Password changed successfully' };
  }
}
