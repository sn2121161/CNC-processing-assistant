import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  KnowledgeBase,
  KnowledgeBaseListParams,
  KnowledgeBaseListResp,
  KnowledgeBaseRelevantResp,
  Calculator,
  CalculatorListParams,
  CalculatorListResp,
  CalculatorCalculateReq,
  CalculatorCalculateResp,
  RecentAccess,
  RecentAccessCreateReq,
  RecentAccessCreateResp,
  RecentAccessListParams,
  RecentAccessListResp,
} from '@shared/api.interface';

// ==================== 知识库相关API ====================

export async function getKnowledgeBaseList(params: KnowledgeBaseListParams): Promise<KnowledgeBaseListResp> {
  try {
    const response = await axiosForBackend({
      url: '/api/knowledge-bases',
      method: 'GET',
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('获取知识库列表失败', error);
    throw error;
  }
}

export async function getKnowledgeBaseDetail(id: string): Promise<KnowledgeBase> {
  try {
    const response = await axiosForBackend({
      url: `/api/knowledge-bases/${id}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取知识库详情失败', error);
    throw error;
  }
}

export async function getKnowledgeBaseRelevant(id: string): Promise<KnowledgeBaseRelevantResp> {
  try {
    const response = await axiosForBackend({
      url: `/api/knowledge-bases/${id}/relevant`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取相关推荐失败', error);
    throw error;
  }
}

// ==================== 计算器相关API ====================

export async function getCalculatorList(params: CalculatorListParams): Promise<CalculatorListResp> {
  try {
    const response = await axiosForBackend({
      url: '/api/calculators',
      method: 'GET',
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('获取计算器列表失败', error);
    throw error;
  }
}

export async function getCalculatorDetail(id: string): Promise<Calculator> {
  try {
    const response = await axiosForBackend({
      url: `/api/calculators/${id}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取计算器详情失败', error);
    throw error;
  }
}

export async function calculate(params: CalculatorCalculateReq, id: string): Promise<CalculatorCalculateResp> {
  try {
    const response = await axiosForBackend({
      url: `/api/calculators/${id}/calculate`,
      method: 'POST',
      data: params,
    });
    return response.data;
  } catch (error) {
    logger.error('计算失败', error);
    throw error;
  }
}

// ==================== 最近访问相关API ====================

export async function createRecentAccess(data: RecentAccessCreateReq): Promise<RecentAccessCreateResp> {
  try {
    const response = await axiosForBackend({
      url: '/api/recent-access',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('记录访问失败', error);
    throw error;
  }
}

export async function getRecentAccess(limit?: number): Promise<RecentAccess[]> {
  try {
    const params: RecentAccessListParams = limit ? { limit } : {};
    const response = await axiosForBackend({
      url: '/api/recent-access',
      method: 'GET',
      params,
    });
    const data: RecentAccessListResp = response.data;
    return data.items;
  } catch (error) {
    logger.error('获取最近访问失败', error);
    throw error;
  }
}
