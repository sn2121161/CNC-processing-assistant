import { Controller, Get, Post, Query, Body } from '@nestjs/common';
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
  async list(@Query('clientId') clientId?: string, @Query('limit') limit?: string): Promise<RecentAccessListResp> {
    const effectiveClientId: string = clientId || 'anonymous';
    const params: RecentAccessListParams = {
      limit: limit ? parseInt(limit, 10) : 10,
    };
    return this.recentAccessService.list(effectiveClientId, params);
  }

  @Post()
  async create(
    @Body() body: RecentAccessCreateReq,
  ): Promise<RecentAccessCreateResp> {
    const clientId: string = body.clientId || 'anonymous';
    return this.recentAccessService.create(clientId, body);
  }
}
