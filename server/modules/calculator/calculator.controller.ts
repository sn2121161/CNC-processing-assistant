import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import type {
  CalculatorListParams,
  CalculatorListResp,
  Calculator,
  CalculatorCalculateReq,
  CalculatorCalculateResp,
  CalculatorCategory,
} from '@shared/api.interface';

@Controller('api/calculators')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Get()
  async list(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<CalculatorListResp> {
    const params: CalculatorListParams = {
      category: category as CalculatorCategory | undefined,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.calculatorService.list(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Calculator> {
    const result = await this.calculatorService.getById(id);
    if (!result) {
      throw new Error('Calculator not found');
    }
    return result;
  }

  @Post(':id/calculate')
  async calculate(
    @Param('id') id: string,
    @Body() req: CalculatorCalculateReq,
  ): Promise<CalculatorCalculateResp> {
    const calculator = await this.calculatorService.getById(id);
    if (!calculator) {
      throw new Error('Calculator not found');
    }
    return this.calculatorService.calculate(calculator, req);
  }
}
