import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppInfo } from '@lark-apaas/client-toolkit/hooks/useAppInfo';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { Card, CardContent } from '@client/src/components/ui/card';
import { Button } from '@client/src/components/ui/button';
import { Badge } from '@client/src/components/ui/badge';
import { UserDisplay } from '@client/src/components/business-ui/user-display';
import {
  BookOpen,
  Bot,
  Code,
  Calculator,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getRecentAccess } from '@client/src/api';
import type { RecentAccess } from '@shared/api.interface';

const featureCards = [
  {
    title: '知识库',
    description: '数控加工专业知识、刀具参数、工艺规程',
    icon: BookOpen,
    path: '/knowledge',
    color: 'from-[#FACC15] to-[#EAB308]',
  },
  {
    title: 'AI对话',
    description: '智能问答、加工问题咨询、参数优化建议',
    icon: Bot,
    path: '/ai-chat',
    color: 'from-[#FB923C] to-[#F97316]',
  },
  {
    title: 'G代码',
    description: '数控代码自动生成、代码校验与优化',
    icon: Code,
    path: '/gcode-generate',
    color: 'from-[#34D399] to-[#10B981]',
  },
  {
    title: '计算器',
    description: '切削参数、刀具补偿、坐标计算',
    icon: Calculator,
    path: '/calculator',
    color: 'from-[#60A5FA] to-[#3B82F6]',
  },
];

const HomePage: React.FC = () => {
  const { appName } = useAppInfo();
  const userInfo = useCurrentUserProfile();
  const navigate = useNavigate();
  const [recentAccess, setRecentAccess] = useState<RecentAccess[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAccess = async () => {
      setLoading(true);
      const items = await getRecentAccess(10);
      setRecentAccess(items);
      setLoading(false);
    };
    fetchRecentAccess();
  }, []);

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const handleRecentItemClick = (item: RecentAccess) => {
    if (item.resourceType === 'knowledge') {
      navigate(`/knowledge/${item.resourceId}`);
    } else if (item.resourceType === 'calculator') {
      navigate(`/calculator/${item.resourceId}`);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'knowledge':
        return '知识库';
      case 'calculator':
        return '计算器';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 md:p-8">
      {/* Hero区域 - 暖调精致风格 */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FEF3C7] via-[#FEF9C3] to-[#ECFDF5] p-8 md:p-12">
        {/* 装饰元素 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#34D399]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* 标签 */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/50">
            <Sparkles className="w-4 h-4 text-[#FACC15]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">CNC 加工助手 V1.0</span>
          </div>
          
          {/* 主标题 */}
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-[#1E293B] mb-4">
            {appName || 'CNC加工助手'}
          </h1>
          
          {/* 副标题 */}
          <p className="text-lg text-[#64748B] max-w-xl mb-8 leading-relaxed">
            数控加工知识库、AI辅助、参数计算一站式平台，助力加工人员提升工作效率
          </p>
          
          {/* 用户欢迎 */}
          {userInfo?.user_id && (
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 w-fit">
              <span className="text-sm text-[#64748B]">欢迎回来，</span>
              <UserDisplay value={[userInfo.user_id]} size="medium" />
            </div>
          )}
        </div>
      </section>

      {/* 快捷功能区 - 卡片网格 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1E293B]">快捷功能</h2>
            <p className="text-sm text-[#64748B] mt-1">快速访问常用工具</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card) => (
            <Card
              key={card.path}
              className="cursor-pointer bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
              onClick={() => handleCardClick(card.path)}
            >
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] mb-2 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                  {card.description}
                </p>
                <div className="flex items-center text-sm font-bold text-[#FACC15] group-hover:text-[#EAB308] transition-colors">
                  <span>立即访问</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 最近访问区 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1E293B]">最近访问</h2>
            <p className="text-sm text-[#64748B] mt-1">快速回到您查看过的内容</p>
          </div>
        </div>
        <Card className="bg-white rounded-[2rem] shadow-sm border border-[#F3F4F6] overflow-hidden">
          {/* 表头 */}
          <div className="bg-[#F9FAFB] px-6 py-4 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-4 text-sm font-semibold text-[#64748B]">
              <span className="w-20">类型</span>
              <span className="flex-1">标题</span>
              <span className="w-32 text-right hidden md:block">日期</span>
            </div>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-[#64748B]">
                <div className="inline-block w-6 h-6 border-2 border-[#F3F4F6] border-t-[#FACC15] rounded-full animate-spin mb-2" />
                <p className="text-sm">加载中...</p>
              </div>
            ) : recentAccess.length > 0 ? (
              <div className="divide-y divide-[#F3F4F6]">
                {recentAccess.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9FAFB] cursor-pointer transition-colors group"
                    onClick={() => handleRecentItemClick(item)}
                  >
                    <Badge className="w-20 justify-center rounded-full bg-[#FEF3C7] text-[#92400E] border-0 font-bold text-xs">
                      {getTypeLabel(item.resourceType)}
                    </Badge>
                    <span className="flex-1 font-medium text-[#1E293B] truncate">
                      {item.resourceTitle}
                    </span>
                    <span className="w-32 text-right text-sm text-[#9CA3AF] hidden md:block">
                      {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#FACC15] transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F9FAFB] rounded-2xl mb-4">
                  <Clock className="w-8 h-8 text-[#9CA3AF]" />
                </div>
                <p className="text-[#64748B] mb-6">暂无最近访问记录</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button 
                    onClick={() => navigate('/knowledge')}
                    className="bg-[#FACC15] text-[#1E293B] hover:bg-[#EAB308] rounded-full font-bold"
                  >
                    浏览知识库
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/calculator')}
                    className="border-[#E5E7EB] text-[#1E293B] hover:bg-[#F9FAFB] rounded-full font-bold"
                  >
                    使用计算器
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;
