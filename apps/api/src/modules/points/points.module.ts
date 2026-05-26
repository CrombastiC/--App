import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PrizeController } from './prize.controller';
import { CommodityController } from './commodity.controller';
import { PointsService } from './points.service';

@Module({
  controllers: [PointsController, PrizeController, CommodityController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
