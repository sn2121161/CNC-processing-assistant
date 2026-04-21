import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE } from '@lark-apaas/fullstack-nestjs-core';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { calculator } from '../../database/schema';
import { eq, sql, desc } from 'drizzle-orm';
import type {
  Calculator,
  CalculatorListItem,
  CalculatorListParams,
  CalculatorListResp,
  CalculatorCalculateReq,
  CalculatorCalculateResp,
  CalculatorCategory,
} from '@shared/api.interface';

@Injectable()
export class CalculatorService {
  private readonly logger = new Logger(CalculatorService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: PostgresJsDatabase,
  ) {}

  async list(params: CalculatorListParams): Promise<CalculatorListResp> {
    const { category, page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (category) {
      conditions.push(eq(calculator.category, category));
    }

    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

    const items = await this.db
      .select({
        id: calculator.id,
        category: calculator.category,
        name: calculator.name,
        description: calculator.description,
      })
      .from(calculator)
      .where(whereClause)
      .orderBy(desc(calculator.createdAt))
      .limit(pageSize)
      .offset(offset);

    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(calculator)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    return {
      items: items.map((item) => ({
        ...item,
        category: item.category as CalculatorCategory,
      })),
      total,
      page,
      pageSize,
    };
  }

  async getById(id: string): Promise<Calculator | null> {
    const result = await this.db
      .select()
      .from(calculator)
      .where(eq(calculator.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const item = result[0];
    return {
      id: item.id,
      category: item.category as CalculatorCategory,
      name: item.name,
      description: item.description,
      // Drizzle ORM infers jsonb as unknown, cast to match interface
      inputSchema: item.inputSchema as any,
      outputSchema: item.outputSchema as any,
      formula: item.formula,
      referenceInfo: item.referenceInfo,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  calculate(calculator: Calculator, params: CalculatorCalculateReq): CalculatorCalculateResp {
    const result: Record<string, number> = {};
    const input = params.params;

    if (!calculator.outputSchema || calculator.outputSchema.length === 0) {
      return { result };
    }

    for (const output of calculator.outputSchema) {
      try {
        if (output.formula && calculator.inputSchema) {
          const formula = output.formula;
          const paramNames = calculator.inputSchema.map((f) => f.name);
          let expression = formula;

          for (const paramName of paramNames) {
            const value = input[paramName];
            if (value !== undefined) {
              expression = expression.replace(new RegExp(paramName, 'g'), String(value));
            }
          }

          try {
            const evalResult = Function(`"use strict"; return (${expression})`)();
            result[output.name] = typeof evalResult === 'number' ? evalResult : 0;
          } catch {
            result[output.name] = 0;
          }
        } else {
          result[output.name] = 0;
        }
      } catch {
        result[output.name] = 0;
      }
    }

    return { result };
  }
}
