import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppInfo } from '@lark-apaas/client-toolkit/hooks/useAppInfo';
import { Button } from '@client/src/components/ui/button';
import {
  Home,
  BookOpen,
  Bot,
  Code,
  Calculator,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/knowledge', label: '知识库', icon: BookOpen },
  { path: '/ai-chat', label: 'AI对话', icon: Bot },
  { path: '/gcode-generate', label: 'G代码', icon: Code },
  { path: '/calculator', label: '计算器', icon: Calculator },
];

const Layout: React.FC = () => {
  const { appName, appLogo } = useAppInfo();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 - 暖调精致风格 */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#F3F4F6]">
        <div className="flex h-16 items-center px-4 lg:px-8">
          {/* Logo 和应用名称 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex aspect-square size-10 items-center justify-center bg-[#1E293B] text-[#FACC15] font-black text-lg tracking-tighter rounded-full shadow-lg shadow-black/10">
              {appLogo ? (
                <img src={appLogo} alt="logo" className="size-6" />
              ) : (
                <span className="text-lg font-black">CNC</span>
              )}
            </div>
            <span className="text-lg font-bold tracking-tight text-[#1E293B] hidden sm:block">
              {appName || 'CNC助手'}
            </span>
          </div>

          {/* 桌面端导航标签 */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-2 bg-[#F9FAFB] rounded-full p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-300 rounded-full ${
                    isActive
                      ? 'bg-[#1E293B] text-white shadow-md'
                      : 'text-[#64748B] hover:text-[#1E293B] hover:bg-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* 右侧占位 + 移动端菜单按钮 */}
          <div className="flex-shrink-0 flex items-center md:w-[130px] md:justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#1E293B]" />
              ) : (
                <Menu className="w-5 h-5 text-[#1E293B]" />
              )}
            </Button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-[#F3F4F6] bg-white/95 backdrop-blur-md px-4 py-3">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-tight transition-all duration-200 rounded-xl ${
                      isActive
                        ? 'bg-[#FACC15] text-[#1E293B]'
                        : 'text-[#64748B] hover:bg-[#F9FAFB] hover:text-[#1E293B]'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
