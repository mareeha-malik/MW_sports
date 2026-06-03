import { Controller, Post, Body, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { RolesGuard } from '../roles/roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(RolesGuard)
  @Get('all')
  async getAllUsers() {
    return this.usersService.findAllSafe();
  }

  // Get user details by ID (Protected route)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: number): Promise<User> {
    try {
      const user = await this.usersService.findOneById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error('Error fetching user: ' + error.message);
    }
  }

  // Create a new user (Admin route or you can remove this if handled by signup in auth)
  @UseGuards(RolesGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() body: { username: string; email: string; password: string }): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const user = new User();
      user.username = body.username;
      user.email = body.email;
      user.password = hashedPassword;
      user.role = 'user';  // Default role, adjust if needed

      return await this.usersService.create(user);
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  }
}
