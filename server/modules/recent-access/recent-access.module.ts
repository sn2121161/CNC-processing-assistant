import { Module } from '@nestjs/common';
import { RecentAccessController } from './recent-access.controller';
import { RecentAccessService } from './recent-access.service';

@Module({
  controllers: [RecentAccessController],
  providers: [RecentAccessService],
})
export class RecentAccessModule {}
