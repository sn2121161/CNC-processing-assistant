// ---- plugin:cnc_qa_generate_1 ----
// ============================================================
// 插件 cnc_qa_generate_1 (CNC问答生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface CncQaGenerateOneInput {
  /** 用户提出的CNC加工相关问题 */
  user_question: string;
  /** 用户的附加要求（可选） */
  additional_requirements?: string;
}

/**
 * capabilityClient.load('cnc_qa_generate_1').call<CncQaGenerateOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface CncQaGenerateOneOutput {
  /** 生成的增量文本内容 */
  content: string;
  /** (已弃用,请使用 content)生成的文本内容 */
  response?: string;
}
// ---- end:cnc_qa_generate_1 ----

// ---- plugin:g_code_generation_1 ----
// ============================================================
// 插件 g_code_generation_1 (G代码生成插件实例) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface GCodeGenerationOneInput {
  /** 其他自定义加工要求（可选） */
  additional_requirements?: string;
  /** 自然语言描述的加工需求 */
  machining_requirement: string;
  /** 目标数控系统类型，可选值：FANUC、Siemens、Mitsubishi等 */
  cnc_system: string;
}

/**
 * capabilityClient.load('g_code_generation_1').call<GCodeGenerationOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface GCodeGenerationOneOutput {
  /** 生成的增量文本内容 */
  content: string;
  /** (已弃用,请使用 content)生成的文本内容 */
  response?: string;
}
// ---- end:g_code_generation_1 ----