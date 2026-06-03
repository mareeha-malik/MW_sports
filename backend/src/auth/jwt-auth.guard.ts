import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      console.error('No token provided in Authorization header');
      return false;
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'L@mb0rghini_2925',
      });
      
      if (!decoded || !decoded.id) {
        console.error('Token missing id field:', decoded);
        return false;
      }

      // Role is optional - set to 'user' if not present
      if (!decoded.role) {
        decoded.role = 'user';
      }

      request.user = decoded;
      return true;
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null;
    }

    const token = authHeader.split(' ')[1]; 
    return token || null;
  }
  
}