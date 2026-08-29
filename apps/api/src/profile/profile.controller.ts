import { Controller, Get, Patch, Req, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: any) {
    return this.profileService.getProfile(req.user);
  }

  @Patch()
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    // The DTO plus the global whitelisting ValidationPipe guarantees that
    // is_premium / plan_name can never arrive here.
    return this.profileService.updateProfile(req.user, body);
  }
}
