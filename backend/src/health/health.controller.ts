import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(@Res() res: Response) {
    const report = await this.healthService.check();

    // Always return HTTP 200 for process liveness so hosting platforms (e.g. Railway)
    // do not abort or terminate a healthy, running container during startup or transient
    // external dependency latency. The full dependency health status (ok, degraded, error)
    // and granular check details remain completely transparent in the JSON payload.
    return res.status(200).json(report);
  }

  @Get('liveness')
  getLiveness(@Res() res: Response) {
    return res.status(200).json({ status: 'ok', uptime: process.uptime() });
  }
}
