import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Tag, ArrowLeft, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import { Streamdown } from '@client/src/components/ui/streamdown';
import { Image } from '@client/src/components/ui/image';
import { getKnowledgeBaseDetail, getKnowledgeBaseRelevant, createRecentAccess } from '@client/src/api';
import type { KnowledgeBase, KnowledgeBaseRelevantResp, KnowledgeCategory } from '@shared/api.interface';
import { logger } from '@lark-apaas/client-toolkit/logger';

const categoryLabels: Record<KnowledgeCategory, string> = {
  cnc_system: '数控系统',
  processing_term: '加工术语',
  tool: '刀具',
  material: '材料',
  gcode: 'G代码',
  process_technology: '加工工艺',
};

const categoryColors: Record<KnowledgeCategory, string> = {
  cnc_system: 'bg-[#FEF3C7] text-[#92400E]',
  processing_term: 'bg-[#E0E7FF] text-[#3730A3]',
  tool: 'bg-[#DCFCE7] text-[#166534]',
  material: 'bg-[#DBEAFE] text-[#1E40AF]',
  gcode: 'bg-[#F3E8FF] text-[#6B21A8]',
  process_technology: 'bg-[#FCE7F3] text-[#9D174D]',
};

const KnowledgeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<KnowledgeBase | null>(null);
  const [relevant, setRelevant] = useState<KnowledgeBaseRelevantResp['items']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detailData, relevantData] = await Promise.all([
          getKnowledgeBaseDetail(id),
          getKnowledgeBaseRelevant(id),
        ]);
        setDetail(detailData);
        setRelevant(relevantData.items || []);

        await createRecentAccess({
          resourceType: 'knowledge',
          resourceId: id,
          resourceTitle: detailData.title,
        });
      } catch (err) {
        logger.error('获取知识库详情失败', err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#F3F4F6] border-t-[#FACC15] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] p-12 text-center">
          <p className="text-[#64748B] mb-6">{error || '未找到该知识条目'}</p>
          <Button 
            onClick={() => navigate('/knowledge')} 
            className="bg-[#FACC15] text-[#1E293B] hover:bg-[#EAB308] rounded-full font-bold"
          >
            返回知识库
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 mb-6 text-sm text-[#64748B]">
        <Link to="/knowledge" className="hover:text-[#FACC15] transition-colors">知识库</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/knowledge?category=${detail.category}`} className="hover:text-[#FACC15] transition-colors">
          {categoryLabels[detail.category]}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#1E293B] truncate max-w-[200px]">{detail.title}</span>
      </div>

      {/* 返回按钮 */}
      <Button
        variant="ghost"
        onClick={() => navigate('/knowledge')}
        className="mb-4 pl-0 text-[#64748B] hover:text-[#1E293B] hover:bg-transparent"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">返回知识库</span>
      </Button>

      {/* 主内容卡片 */}
      <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] mb-8 overflow-hidden">
        <CardHeader className="p-8 pb-6 border-b border-[#F3F4F6]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1E293B] flex-1">
              {detail.title}
            </h1>
            <Badge className={`shrink-0 rounded-full border-0 font-bold text-xs ${categoryColors[detail.category]}`}>
              {categoryLabels[detail.category]}
            </Badge>
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>更新于 {new Date(detail.updatedAt).toLocaleDateString('zh-CN')}</span>
            </div>
            {detail.tags && detail.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <div className="flex flex-wrap gap-2">
                  {detail.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs px-3 py-1 bg-[#F9FAFB] text-[#64748B] rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        {/* 封面图片 */}
        {detail.coverImages && detail.coverImages.length > 0 && (
          <CardContent className="p-8">
            <div className="w-full bg-[#F9FAFB] rounded-2xl overflow-hidden">
              <Image
                src={detail.coverImages[0]}
                alt={detail.title}
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </CardContent>
        )}

        {/* 正文内容 */}
        <CardContent className="p-8 pt-0">
          <div className="prose prose-slate max-w-none">
            <Streamdown>{detail.content}</Streamdown>
          </div>
        </CardContent>

        {/* 参数信息 */}
        {detail.params && Object.keys(detail.params).length > 0 && (
          <CardContent className="p-8 pt-0">
            <div className="border-t border-[#F3F4F6] pt-6">
              <h3 className="text-lg font-bold tracking-tight text-[#1E293B] mb-4">参数信息</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {detail.params.hardness && (
                  <div className="bg-[#F9FAFB] p-4 rounded-xl">
                    <div className="text-xs text-[#9CA3AF] font-medium uppercase mb-1">材料硬度</div>
                    <div className="text-lg font-bold text-[#1E293B]">{detail.params.hardness}</div>
                  </div>
                )}
                {detail.params.density && (
                  <div className="bg-[#F9FAFB] p-4 rounded-xl">
                    <div className="text-xs text-[#9CA3AF] font-medium uppercase mb-1">密度</div>
                    <div className="text-lg font-bold text-[#1E293B]">{detail.params.density}</div>
                  </div>
                )}
                {detail.params.machinability && (
                  <div className="bg-[#F9FAFB] p-4 rounded-xl">
                    <div className="text-xs text-[#9CA3AF] font-medium uppercase mb-1">可加工性</div>
                    <div className="text-lg font-bold text-[#1E293B]">{detail.params.machinability}</div>
                  </div>
                )}
                {detail.params.cuttingSpeed && (
                  <div className="bg-[#F9FAFB] p-4 rounded-xl">
                    <div className="text-xs text-[#9CA3AF] font-medium uppercase mb-1">切削速度</div>
                    <div className="text-lg font-bold text-[#1E293B]">{detail.params.cuttingSpeed}</div>
                  </div>
                )}
                {detail.params.feedRate && (
                  <div className="bg-[#F9FAFB] p-4 rounded-xl">
                    <div className="text-xs text-[#9CA3AF] font-medium uppercase mb-1">进给率</div>
                    <div className="text-lg font-bold text-[#1E293B]">{detail.params.feedRate}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 相关推荐 */}
      {relevant.length > 0 && (
        <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6]">
          <CardHeader className="p-8 pb-4 border-b border-[#F3F4F6]">
            <CardTitle className="text-lg font-bold tracking-tight text-[#1E293B]">相关推荐</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevant.map((item) => (
                <Link
                  key={item.id}
                  to={`/knowledge/${item.id}`}
                  className="block p-5 bg-[#F9FAFB] rounded-2xl hover:bg-[#FEF3C7] transition-all duration-200 group"
                >
                  <h4 className="font-bold text-[#1E293B] mb-1 line-clamp-1 group-hover:text-[#92400E]">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[#64748B] line-clamp-2">{item.summary}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeDetailPage;
