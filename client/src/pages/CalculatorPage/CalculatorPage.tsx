import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ChevronRight, Layers, Cog, Ruler, Beaker, Grid3X3, Sparkles } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@client/src/components/ui/empty';
import { getCalculatorList, createRecentAccess } from '@client/src/api';
import type { CalculatorListItem, CalculatorCategory } from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';

const categoryConfig: Record<CalculatorCategory, { label: string; icon: React.ElementType; color: string }> = {
  cutting_param: { label: '切削参数', icon: Cog, color: 'from-[#FACC15] to-[#EAB308]' },
  thread_processing: { label: '螺纹加工', icon: Grid3X3, color: 'from-[#FB923C] to-[#F97316]' },
  geometry: { label: '几何计算', icon: Ruler, color: 'from-[#34D399] to-[#10B981]' },
  material: { label: '材料参数', icon: Beaker, color: 'from-[#60A5FA] to-[#3B82F6]' },
  general: { label: '通用计算', icon: Layers, color: 'from-[#A78BFA] to-[#8B5CF6]' },
};

const CalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CalculatorCategory | ''>('');
  const [list, setList] = useState<CalculatorListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getCalculatorList({
        category: selectedCategory || undefined,
      });
      setList(resp.items);
    } catch (error) {
      logger.error('获取计算器列表失败', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCategoryClick = (category: CalculatorCategory) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  const handleCardClick = async (item: CalculatorListItem) => {
    try {
      await createRecentAccess({
        resourceType: 'calculator',
        resourceId: item.id,
        resourceTitle: item.name,
      });
    } catch (error) {
      logger.error('记录访问失败', error);
    }
    navigate(`/calculator/${item.id}`);
  };

  return (
    <div className="p-4 md:p-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-1 bg-[#FACC15] rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">Calculator Tools</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1E293B] mb-3">
              加工参数计算器
            </h1>
            <p className="text-sm text-[#64748B] max-w-md">
              提供切削参数、螺纹加工、几何计算等常用计算工具
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-[#F3F4F6]">
            <Sparkles className="w-4 h-4 text-[#FACC15]" />
            <span className="text-xs font-medium text-[#64748B]">{list.length} 个工具</span>
          </div>
        </div>
      </div>

      {/* 分类导航 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(categoryConfig) as CalculatorCategory[]).map((category) => {
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

      {/* 计算器列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] animate-pulse">
              <CardHeader className="p-6">
                <div className="h-6 bg-[#F3F4F6] rounded-lg w-2/3 mb-3" />
                <div className="h-4 bg-[#F3F4F6] rounded-lg w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] p-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calculator className="w-8 h-8 text-[#9CA3AF]" />
              </EmptyMedia>
              <EmptyTitle className="text-[#1E293B]">暂无计算器</EmptyTitle>
              <EmptyDescription className="text-[#64748B]">该分类下暂无可用计算器</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((item) => {
            const itemCategoryConfig = categoryConfig[item.category];
            return (
              <Card
                key={item.id}
                className="cursor-pointer bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                onClick={() => handleCardClick(item)}
              >
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold tracking-tight text-[#1E293B] mb-3 group-hover:text-[#FACC15] transition-colors">
                        {item.name}
                      </CardTitle>
                      <Badge className="rounded-full bg-[#F9FAFB] text-[#64748B] border-0 text-xs font-bold uppercase tracking-wider">
                        {itemCategoryConfig?.label || item.category}
                      </Badge>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${itemCategoryConfig?.color || 'from-[#FACC15] to-[#EAB308]'} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="text-sm text-[#64748B] line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center text-sm font-bold text-[#FACC15] group-hover:text-[#EAB308] transition-colors">
                    打开计算器
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 底部说明 */}
      <Card className="mt-8 bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6]">
        <CardContent className="p-6">
          <h4 className="font-bold tracking-tight text-[#1E293B] mb-4">使用说明</h4>
          <ul className="text-sm text-[#64748B] space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full mt-2 shrink-0" />
              <span>选择分类查看对应类型的计算器</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full mt-2 shrink-0" />
              <span>点击计算器卡片进入详情页面</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full mt-2 shrink-0" />
              <span>根据提示输入参数，系统将自动计算结果</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full mt-2 shrink-0" />
              <span>计算结果仅供参考，实际加工请根据经验和机床情况调整</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorPage;
