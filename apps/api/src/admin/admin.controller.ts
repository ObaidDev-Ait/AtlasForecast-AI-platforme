import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get('subscriptions')
  async getSubscriptions() {
    return this.adminService.getSubscriptions();
  }

  @Post('users/:id/role')
  async updateUserRole(
    @Request() req: any,
    @Param('id') id: string,
    @Body('role') role: 'user' | 'admin',
  ) {
    return this.adminService.updateUserRole(req.user, id, role);
  }
}
