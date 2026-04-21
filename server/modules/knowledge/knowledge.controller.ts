import { Controller, Get, Param, Query } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import type {
  KnowledgeBaseListParams,
  KnowledgeBaseListResp,
  KnowledgeBase,
  KnowledgeBaseRelevantResp,
  KnowledgeCategory,
} from '@shared/api.interface';

@Controller('api/knowledge-bases')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  async list(
    @Query('category') category?: string,
    @Query('keyword') keyword?: string,
    @Query('tag') tag?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<KnowledgeBaseListResp> {
    const params: KnowledgeBaseListParams = {
      category: category as KnowledgeCategory | undefined,
      keyword,
      tag,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.knowledgeService.list(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<KnowledgeBase> {
    const result = await this.knowledgeService.getById(id);
    if (!result) {
      throw new Error('Knowledge base not found');
    }
    return result;
  }

  @Get(':id/relevant')
  async getRelevant(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ): Promise<KnowledgeBaseRelevantResp> {
    return this.knowledgeService.getRelevant(id, limit ? parseInt(limit, 10) : 5);
  }
}
