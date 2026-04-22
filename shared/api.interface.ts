/* 前后端共享的类型写在这里 */

// ==================== 知识库相关类型 ====================

export type KnowledgeCategory = 'cnc_system' | 'processing_term' | 'tool' | 'material' | 'gcode' | 'process_technology';

export interface KnowledgeBase {
  id: string;
  category: KnowledgeCategory;
  title: string;
  summary: string;
  content: string;
  coverImages: string[];
  tags: string[];
  params?: {
    hardness?: string;
    density?: string;
    machinability?: string;
    cuttingSpeed?: string;
    feedRate?: string;
    toolParams?: Record<string, any>;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBaseListItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  summary: string;
  tags: string[];
}

export interface KnowledgeBaseListParams {
  category?: KnowledgeCategory;
  keyword?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface KnowledgeBaseListResp {
  items: KnowledgeBaseListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface KnowledgeBaseRelevantResp {
  items: Array<{
    id: string;
    title: string;
    summary: string;
  }>;
}

// ==================== 计算器相关类型 ====================

export type CalculatorCategory = 'cutting_param' | 'thread_processing' | 'geometry' | 'material' | 'general';

export interface CalculatorInputField {
  name: string;
  label: string;
  type: 'number' | 'select' | 'text';
  unit?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
  required?: boolean;
}

export interface CalculatorOutputField {
  name: string;
  label: string;
  unit?: string;
  formula?: string;
  description?: string;
}

export interface Calculator {
  id: string;
  category: CalculatorCategory;
  name: string;
  description: string;
  inputSchema: CalculatorInputField[];
  outputSchema: CalculatorOutputField[];
  formula: string;
  referenceInfo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatorListItem {
  id: string;
  category: CalculatorCategory;
  name: string;
  description: string;
}

export interface CalculatorListParams {
  category?: CalculatorCategory;
  page?: number;
  pageSize?: number;
}

export interface CalculatorListResp {
  items: CalculatorListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CalculatorCalculateReq {
  params: Record<string, number | string>;
}

export interface CalculatorCalculateResp {
  result: Record<string, number>;
}

// ==================== 最近访问相关类型 ====================

export type ResourceType = 'knowledge' | 'calculator';

export interface RecentAccess {
  id: string;
  resourceType: ResourceType;
  resourceId: string;
  resourceTitle: string;
  createdAt: string;
}

export interface RecentAccessListParams {
  limit?: number;
  clientId?: string;
}

export interface RecentAccessListResp {
  items: RecentAccess[];
}

export interface RecentAccessCreateReq {
  resourceType: ResourceType;
  resourceId: string;
  resourceTitle: string;
  clientId: string;
}

export interface RecentAccessCreateResp {
  success: boolean;
}
