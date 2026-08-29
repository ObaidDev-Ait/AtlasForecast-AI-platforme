import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { SupabaseService } from './supabase.service';

@Controller('supabase')
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('ping')
  async ping(@Res() res: Response) {
    const result = await this.supabaseService.verifyConnection();
    // A dependency probe must not report 200 when the dependency is down.
    return res.status(result.status === 'ok' ? 200 : 503).json(result);
  }
}
