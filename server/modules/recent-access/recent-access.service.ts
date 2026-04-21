import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE } from '@lark-apaas/fullstack-nestjs-core';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { recentAccess } from '../../database/schema';
import { eq, sql, desc } from 'drizzle-orm';
import type {
  RecentAccess,
  RecentAccessListParams,
  RecentAccessListResp,
  RecentAccessCreateReq,
  RecentAccessCreateResp,
  ResourceType,
} from '@shared/api.interface';

@Injectable()
export class RecentAccessService {
  private readonly logger = new Logger(RecentAccessService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: PostgresJsDatabase,
  ) {}

  async list(userId: string, params: RecentAccessListParams): Promise<RecentAccessListResp> {
    const { limit = 10 } = params;

    const items = await this.db
      .select({
        id: recentAccess.id,
        resourceType: recentAccess.resourceType,
        resourceId: recentAccess.resourceId,
        resourceTitle: recentAccess.resourceTitle,
        createdAt: recentAccess.createdAt,
      })
      .from(recentAccess)
      .where(eq(recentAccess.userId, userId))
      .orderBy(desc(recentAccess.createdAt))
      .limit(limit);

    return {
      items: items.map((item) => ({
        ...item,
        resourceType: item.resourceType as ResourceType,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  async create(userId: string, req: RecentAccessCreateReq): Promise<RecentAccessCreateResp> {
    await this.db.insert(recentAccess).values({
      userId,
      resourceType: req.resourceType,
      resourceId: req.resourceId,
      resourceTitle: req.resourceTitle,
    });

    return { success: true };
  }
}
