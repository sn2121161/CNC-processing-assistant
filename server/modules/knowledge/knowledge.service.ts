import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE } from '@lark-apaas/fullstack-nestjs-core';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { knowledgeBase } from '../../database/schema';
import { eq, like, or, sql, desc, and } from 'drizzle-orm';
import type {
  KnowledgeBase,
  KnowledgeBaseListParams,
  KnowledgeBaseListResp,
  KnowledgeBaseRelevantResp,
  KnowledgeCategory,
} from '@shared/api.interface';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: PostgresJsDatabase,
  ) {}

  async list(params: KnowledgeBaseListParams): Promise<KnowledgeBaseListResp> {
    const { category, keyword, tag, page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (category) {
      conditions.push(eq(knowledgeBase.category, category));
    }
    if (keyword) {
      conditions.push(
        or(
          like(knowledgeBase.title, `%${keyword}%`),
          like(knowledgeBase.summary, `%${keyword}%`),
        ),
      );
    }
    if (tag) {
      // 使用数组包含操作符，检查 tags 数组是否包含指定标签
      conditions.push(sql`${knowledgeBase.tags} @> ARRAY[${tag}]::varchar[]`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await this.db
      .select({
        id: knowledgeBase.id,
        category: knowledgeBase.category,
        title: knowledgeBase.title,
        summary: knowledgeBase.summary,
        tags: knowledgeBase.tags,
      })
      .from(knowledgeBase)
      .where(whereClause)
      .orderBy(desc(knowledgeBase.createdAt))
      .limit(pageSize)
      .offset(offset);

    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(knowledgeBase)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    return {
      items: items.map((item) => ({
        ...item,
        category: item.category as KnowledgeCategory,
      })),
      total,
      page,
      pageSize,
    };
  }

  async getById(id: string): Promise<KnowledgeBase | null> {
    const result = await this.db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const item = result[0];
    return {
      id: item.id,
      category: item.category as KnowledgeCategory,
      title: item.title,
      summary: item.summary,
      content: item.content,
      coverImages: item.coverImages ?? [],
      tags: item.tags ?? [],
      params: item.params,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async getRelevant(id: string, limit = 5): Promise<KnowledgeBaseRelevantResp> {
    const current = await this.getById(id);
    if (!current) {
      return { items: [] };
    }

    const items = await this.db
      .select({
        id: knowledgeBase.id,
        title: knowledgeBase.title,
        summary: knowledgeBase.summary,
      })
      .from(knowledgeBase)
      .where(
        and(
          eq(knowledgeBase.category, current.category),
          sql`${knowledgeBase.id} != ${id}`,
        ),
      )
      .orderBy(desc(knowledgeBase.createdAt))
      .limit(limit);

    return { items };
  }
}
