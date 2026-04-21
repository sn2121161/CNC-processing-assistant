import { Controller, Get, Post, Query, Body, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request } from 'express';
import { RecentAccessService } from './recent-access.service';
import type {
  RecentAccessListParams,
  RecentAccessListResp,
  RecentAccessCreateReq,
  RecentAccessCreateResp,
} from '@shared/api.interface';

@Controller('api/recent-access')
export class RecentAccessController {
  constructor(private readonly recentAccessService: RecentAccessService) {}

  @Get()
  async list(@Req() req: Request, @Query('limit') limit?: string): Promise<RecentAccessListResp> {
    const userId = req.userContext.userId;
    const params: RecentAccessListParams = {
      limit: limit ? parseInt(limit, 10) : 10,
    };
    return this.recentAccessService.list(userId, params);
  }

  @NeedLogin()
  @Post()
  async create(
    @Req() req: Request,
    @Body() body: RecentAccessCreateReq,
  ): Promise<RecentAccessCreateResp> {
    const userId = req.userContext.userId;
    return this.recentAccessService.create(userId, body);
  }
}
