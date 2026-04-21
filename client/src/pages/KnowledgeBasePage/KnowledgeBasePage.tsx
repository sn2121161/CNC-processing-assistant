import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Cpu, Scissors, Layers, Code2, ChevronRight, Sparkles, Settings } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@client/src/components/ui/empty';
import { getKnowledgeBaseList, createRecentAccess } from '@client/src/api';
import type { KnowledgeBaseListItem, KnowledgeCategory } from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';

const categoryConfig: Record<KnowledgeCategory, { label: string; icon: React.ElementType }> = {
  cnc_system: { label: '数控系统', icon: Cpu },
  processing_term: { label: '加工术语', icon: BookOpen },
  tool: { label: '刀具', icon: Scissors },
  material: { label: '材料', icon: Layers },
  gcode: { label: 'G代码', icon: Code2 },
  process_technology: { label: '加工工艺', icon: Settings },
};

// 加工术语二级分类配置
const processingTermSubCategories = [
  { key: '加工参数', label: '加工参数', desc: '主轴倍率、切削速度、进给量等' },
  { key: '机床与运动轴', label: '机床与运动轴', desc: 'X/Y/Z轴、主轴、伺服系统等' },
  { key: '坐标系与偏置', label: '坐标系与偏置', desc: '工件坐标系、刀补等' },
  { key: '工艺与循环', label: '工艺与循环/刀路', desc: '粗精加工、进退刀等' },
  { key: '工装夹具与工件', label: '工装夹具与工件', desc: '卡盘、夹紧、定位等' },
  { key: '质量与公差', label: '质量/公差表面', desc: '粗糙度、公差、形位公差等' },
  { key: '测量与对刀', label: '测量/对刀/补偿', desc: '对刀仪、探针、补偿等' },
  { key: '故障与安全', label: '故障/安全/诊断', desc: '报警、急停、安全回路等' },
];

// 材料二级分类配置
const materialSubCategories = [
  { key: '铝', label: '铝', desc: '6061、7075、5052等铝合金' },
  { key: '钢', label: '钢', desc: '45#、Q235、40Cr等碳钢合金钢' },
  { key: '不锈钢', label: '不锈钢', desc: '304、316、430等不锈钢' },
  { key: '钛合金', label: '钛合金', desc: 'TC4、TA2等钛合金' },
  { key: '黄铜', label: '黄铜', desc: 'H62、H59等黄铜材料' },
  { key: '塑料', label: '塑料', desc: 'POM、PA66、PEEK等工程塑料' },
  { key: '铸铁', label: '铸铁', desc: 'HT200、QT500等铸铁' },
  { key: '铜', label: '铜', desc: 'T2纯铜、H68黄铜等铜材' },
];

const KnowledgeBasePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory | ''>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [list, setList] = useState<KnowledgeBaseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      // 对于加工术语和材料分类，如果有选中的子分类，使用 tag 参数过滤
      const shouldUseTagFilter = (selectedCategory === 'processing_term' || selectedCategory === 'material') && selectedSubCategory;
      const resp = await getKnowledgeBaseList({
        category: selectedCategory || undefined,
        keyword: keyword || undefined,
        tag: shouldUseTagFilter ? selectedSubCategory : undefined,
        page,
        pageSize,
      });
      setList(resp.items);
      setTotal(resp.total);
    } catch (error) {
      logger.error('获取知识库列表失败', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, keyword, selectedSubCategory, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCategoryClick = (category: KnowledgeCategory) => {
    if (selectedCategory === category) {
      setSelectedCategory('');
      setSelectedSubCategory('');
    } else {
      setSelectedCategory(category);
      // 选中材料分类时，默认选中"铝"
      if (category === 'material') {
        setSelectedSubCategory('铝');
      } else if (category === 'processing_term') {
        // 选中加工术语分类时，默认选中第一个子分类"加工参数"
        setSelectedSubCategory('加工参数');
      } else {
        setSelectedSubCategory('');
      }
    }
    setPage(1);
  };

  const handleSubCategoryClick = (subKey: string) => {
    setSelectedSubCategory(selectedSubCategory === subKey ? '' : subKey);
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchList();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCardClick = async (item: KnowledgeBaseListItem) => {
    try {
      await createRecentAccess({
        resourceType: 'knowledge',
        resourceId: item.id,
        resourceTitle: item.title,
      });
    } catch (error) {
      logger.error('记录访问失败', error);
    }
    navigate(`/knowledge/${item.id}`);
  };

  // 数据已在服务端过滤，直接使用 list
  const displayList = list;
  const displayTotal = total;
  const totalPages = Math.ceil(displayTotal / pageSize);

  return (
    <div className="p-4 md:p-8">
      {/* 页面标题 - 暖调精致风格 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-1 bg-[#FACC15] rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">Knowledge Base</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1E293B] mb-3">
              知识库
            </h1>
            <p className="text-sm text-[#64748B] max-w-md">
              查找数控系统、加工术语、刀具、材料、G代码等专业知识
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-[#F3F4F6]">
            <Sparkles className="w-4 h-4 text-[#FACC15]" />
            <span className="text-xs font-medium text-[#64748B]">共 {total} 条知识</span>
          </div>
        </div>
      </div>

      {/* 分类导航 - 胶囊按钮风格 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(categoryConfig) as KnowledgeCategory[]).map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            const isActive = selectedCategory === category;
            return (
              <Button
                key={category}
                variant="outline"
                onClick={() => handleCategoryClick(category)}
                className={`flex items-center gap-2 h-12 px-5 font-semibold tracking-tight rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-lg shadow-[#1E293B]/20' 
                    : 'bg-white text-[#1E293B] border-[#F3F4F6] hover:bg-[#FACC15] hover:border-[#FACC15] hover:text-[#1E293B]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{config.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 加工术语二级分类导航 */}
      {selectedCategory === 'processing_term' && (
        <div className="mb-6 bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mb-4">
            按分类浏览加工术语
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {processingTermSubCategories.map((sub) => {
              const isActive = selectedSubCategory === sub.key;
              return (
                <button
                  key={sub.key}
                  onClick={() => handleSubCategoryClick(sub.key)}
                  className={`h-auto py-4 px-4 text-left rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-[#FACC15] text-[#1E293B] shadow-lg shadow-[#FACC15]/30'
                      : 'bg-[#F9FAFB] text-[#1E293B] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-bold truncate">{sub.label}</span>
                      <span className="text-xs text-[#9CA3AF] line-clamp-1">{sub.desc}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 材料二级分类导航 */}
      {selectedCategory === 'material' && (
        <div className="mb-6 bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] mb-4">
            按照分类浏览材料
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {materialSubCategories.map((sub) => {
              const isActive = selectedSubCategory === sub.key;
              return (
                <button
                  key={sub.key}
                  onClick={() => handleSubCategoryClick(sub.key)}
                  className={`h-auto py-4 px-4 text-left rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-[#FACC15] text-[#1E293B] shadow-lg shadow-[#FACC15]/30'
                      : 'bg-[#F9FAFB] text-[#1E293B] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-bold truncate">{sub.label}</span>
                      <span className="text-xs text-[#9CA3AF] line-clamp-1">{sub.desc}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="mb-8 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          <Input
            type="search"
            placeholder="搜索知识库..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-12 h-12 bg-white border-[#F3F4F6] rounded-2xl text-[#1E293B] placeholder:text-[#9CA3AF] focus:border-[#FACC15] focus:ring-[#FACC15]/20"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          className="h-12 px-8 bg-[#FACC15] text-[#1E293B] hover:bg-[#EAB308] rounded-full font-bold transition-all duration-300"
        >
          搜索
        </Button>
      </div>

      {/* 知识库列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] animate-pulse">
              <CardHeader className="p-6">
                <div className="h-6 bg-[#F3F4F6] rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-[#F3F4F6] rounded-lg w-full mb-2" />
                <div className="h-4 bg-[#F3F4F6] rounded-lg w-2/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] p-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen className="w-8 h-8 text-[#9CA3AF]" />
              </EmptyMedia>
              <EmptyTitle className="text-[#1E293B]">暂无知识条目</EmptyTitle>
              <EmptyDescription className="text-[#64748B]">尝试切换分类或修改关键词搜索</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayList.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                onClick={() => handleCardClick(item)}
              >
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg font-bold tracking-tight text-[#1E293B] line-clamp-2 group-hover:text-[#FACC15] transition-colors">
                      {item.title}
                    </CardTitle>
                    <Badge className="shrink-0 rounded-full bg-[#F3F4F6] text-[#64748B] border-0 text-[10px] font-bold uppercase tracking-wider">
                      {categoryConfig[item.category]?.label || item.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-sm text-[#64748B] line-clamp-3 mb-4 leading-relaxed">
                    {item.summary}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag} 
                          className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-[#F9FAFB] text-[#9CA3AF] rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-12 px-6 rounded-2xl border-[#F3F4F6] bg-white text-[#1E293B] hover:bg-[#F9FAFB] hover:border-[#E5E7EB] disabled:opacity-50 transition-all"
              >
                上一页
              </Button>
              <span className="px-6 py-3 bg-white rounded-2xl border border-[#F3F4F6] text-sm font-medium text-[#64748B]">
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-12 px-6 rounded-2xl border-[#F3F4F6] bg-white text-[#1E293B] hover:bg-[#F9FAFB] hover:border-[#E5E7EB] disabled:opacity-50 transition-all"
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KnowledgeBasePage;
