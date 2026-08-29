import { Controller, Get, Post, Delete, Req, Body, Param, UseGuards } from '@nestjs/common';
import { SavedCitiesService } from './saved-cities.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('cities')
@UseGuards(AuthGuard)
export class SavedCitiesController {
  constructor(private readonly savedCitiesService: SavedCitiesService) {}

  @Get()
  async getCities(@Req() req: any) {
    return this.savedCitiesService.getCities(req.user);
  }

  @Post()
  async addCity(@Req() req: any, @Body() body: any) {
    return this.savedCitiesService.addCity(req.user, body);
  }

  @Delete(':id')
  async deleteCity(@Req() req: any, @Param('id') id: string) {
    return this.savedCitiesService.deleteCity(req.user, id);
  }
}
