import { Controller, Get, Patch, Req, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user);
  }

  @Patch()
  async updateProfile(@Req() req: any, @Body() body: any) {
    return this.profileService.updateProfile(req.user, body);
  }
}
