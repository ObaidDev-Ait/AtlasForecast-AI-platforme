import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(@Res() res: Response) {
    const report = await this.healthService.check();

    // 503 only when a *required* dependency is down. 'degraded' (an optional
    // integration not configured) still reports 200 so the endpoint stays
    // usable as a liveness probe.
    const httpStatus = report.status === 'error' ? 503 : 200;
    return res.status(httpStatus).json(report);
  }
}
