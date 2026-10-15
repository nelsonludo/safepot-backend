import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class RlsMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.id || (req.headers['x-user-id'] as string) || null;

    if (userId) {
      try {
        const sanitizedUserId = userId.replace(/'/g, "''");
        await this.dataSource.query(`SET LOCAL app.current_user_id = '${sanitizedUserId}'`);
      } catch {
        // Silently skip if DB session not yet available or in non-transaction context
      }
    }

    next();
  }
}
