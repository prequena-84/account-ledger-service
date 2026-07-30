import { Injectable } from '@nestjs/common';
import type { IHealth } from '../interfaces/types/health.interfaces';

@Injectable()
export class HealthRepository {
  getHealth({ status, app, timestamp, version }): IHealth {
    return {
      status,
      app,
      timestamp,
      version,
    };
  };
};