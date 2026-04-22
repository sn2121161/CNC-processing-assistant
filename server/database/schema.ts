/* eslint-disable */
/** auto generated, do not edit */
import { pgTable, index, pgPolicy, uuid, varchar, text, jsonb, customType } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const userProfile = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: string) {
    return sql`ROW(${value})::user_profile`;
  },
  fromDriver(value: string) {
    const [userId] = value.slice(1, -1).split(',');
    return userId.trim();
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: string;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: string): FileAttachment {
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});

/** Escape single quotes in SQL string literals */
function escapeLiteral(str: string): string {
  return `'${str.replace(/'/g, "''")}'`;
}

export const userProfileArray = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return 'user_profile[]';
  },
  toDriver(value: string[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::user_profile[]`;
    }
    const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
    return sql.raw(`ARRAY[${elements}]::user_profile[]`);
  },
  fromDriver(value: string): string[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => m.slice(1, -1).split(',')[0].trim());
  },
});

export const fileAttachmentArray = customType<{
  data: FileAttachment[];
  driverData: string;
}>({
  dataType() {
    return 'file_attachment[]';
  },
  toDriver(value: FileAttachment[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::file_attachment[]`;
    }
    const elements = value.map(f =>
      `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`
    ).join(',');
    return sql.raw(`ARRAY[${elements}]::file_attachment[]`);
  },
  fromDriver(value: string): FileAttachment[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => {
      const [bucketId, filePath] = m.slice(1, -1).split(',');
      return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    });
  },
});

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number};
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number){
    if(value == null) return value as any;
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    if(typeof value === 'string') {
      return value;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if(value instanceof Date) return value;
    return new Date(value);
  },
});

export const calculator = pgTable("calculator", {
  id: uuid().defaultRandom().notNull(),
  category: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  /**
   * @type { Array<{ name: string; label: string; type: "number" | "select" | "text"; unit?: string; options?: Array<{ label: string; value: string }>; defaultValue?: any; required?: boolean; }> }
   */
  inputSchema: jsonb("input_schema").notNull(),
  /**
   * @type { Array<{ name: string; label: string; unit?: string; formula?: string; description?: string; }> }
   */
  outputSchema: jsonb("output_schema").notNull(),
  formula: text(),
  referenceInfo: text("reference_info"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  index("idx_calculator_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
  index("idx_calculator_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
  pgPolicy("service_role_bypass_policy_calculator", { as: "permissive", for: "all", to: ["service_role_workspace_aadj3zvfjisds"], using: sql`true`, withCheck: sql`true` }),
  pgPolicy("查看全部数据_calculator", { as: "permissive", for: "select", to: ["anon_workspace_aadj3zvfjisds", "authenticated_workspace_aadj3zvfjisds"] }),
  pgPolicy("匿名用户写入_calculator", { as: "permissive", for: "all", to: ["anon_workspace_aadj3zvfjisds"] }),
]);

export const knowledgeBase = pgTable("knowledge_base", {
  id: uuid().defaultRandom().notNull(),
  category: varchar({ length: 255 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  summary: text(),
  content: text(),
  coverImages: text("cover_images").array(),
  tags: varchar({ length: 255 }).array(),
  /**
   * @type { hardness?: string; density?: string; machinability?: string; cuttingSpeed?: string; feedRate?: string; toolParams?: Record<string, any>; }
   */
  params: jsonb(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  index("idx_knowledge_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
  index("idx_knowledge_title").using("btree", table.title.asc().nullsLast().op("text_ops")),
  pgPolicy("service_role_bypass_policy_knowledge_base", { as: "permissive", for: "all", to: ["service_role_workspace_aadj3zvfjisds"], using: sql`true`, withCheck: sql`true` }),
  pgPolicy("查看全部数据_knowledge_base", { as: "permissive", for: "select", to: ["anon_workspace_aadj3zvfjisds", "authenticated_workspace_aadj3zvfjisds"] }),
  pgPolicy("匿名用户写入_knowledge_base", { as: "permissive", for: "all", to: ["anon_workspace_aadj3zvfjisds"] }),
]);

export const recentAccess = pgTable("recent_access", {
  id: uuid().defaultRandom().notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  resourceType: varchar("resource_type", { length: 255 }).notNull(),
  resourceId: varchar("resource_id", { length: 255 }).notNull(),
  resourceTitle: varchar("resource_title", { length: 255 }),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  index("idx_recent_access_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
  pgPolicy("service_role_bypass_policy_recent_access", { as: "permissive", for: "all", to: ["service_role_workspace_aadj3zvfjisds"], using: sql`true`, withCheck: sql`true` }),
  pgPolicy("查看全部数据_recent_access", { as: "permissive", for: "select", to: ["anon_workspace_aadj3zvfjisds", "authenticated_workspace_aadj3zvfjisds"] }),
  pgPolicy("匿名用户写入_recent_access", { as: "permissive", for: "all", to: ["anon_workspace_aadj3zvfjisds"] }),
]);

// table aliases
export const calculatorTable = calculator;
export const knowledgeBaseTable = knowledgeBase;
export const recentAccessTable = recentAccess;
