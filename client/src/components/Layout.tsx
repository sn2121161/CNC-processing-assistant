import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppInfo } from '@lark-apaas/client-toolkit/hooks/useAppInfo';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@client/src/components/ui/dropdown-menu';
import { Button } from '@client/src/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@client/src/components/ui/avatar';
import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  Home,
  BookOpen,
  Bot,
  Code,
  Calculator,
  LogOut,
  User,
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
  const userInfo = useCurrentUserProfile();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    const dataloom = await getDataloom();
    const result = await dataloom.service.session.signOut();
    if (result.error) {
      logger.error('退出登录失败:', result.error.message);
      return;
    }
    window.location.reload();
  };

  const handleLogin = async () => {
    const dataloom = await getDataloom();
    dataloom.service.session.redirectToLogin();
  };

  const isLoggedIn = !!userInfo?.user_id;

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 - 暖调精致风格 */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#F3F4F6]">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Logo 和应用名称 */}
          <div className="flex items-center gap-3">
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
          <nav className="hidden md:flex items-center gap-2 bg-[#F9FAFB] rounded-full p-1">
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

          {/* 用户信息和移动端菜单按钮 */}
          <div className="flex items-center gap-3">
            {/* 用户信息下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 p-0 rounded-full border border-[#E5E7EB] hover:border-[#FACC15] hover:ring-2 hover:ring-[#FACC15]/30 transition-all duration-300"
                >
                  <Avatar className="h-9 w-9 rounded-full">
                    <AvatarImage
                      src={isLoggedIn ? userInfo?.avatar : 'https://lf3-static.bytednsdoc.com/obj/eden-cn/LMfspH/ljhwZthlaukjlkulzlp/miao/no-person.svg'}
                      alt={isLoggedIn ? userInfo?.name : '游客'}
                    />
                    <AvatarFallback className="bg-[#F3F4F6] text-[#1E293B] font-bold rounded-full text-sm">
                      {isLoggedIn ? userInfo?.name?.charAt(0) || 'U' : '游'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-[#F3F4F6] rounded-2xl shadow-xl p-2">
                <div className="flex items-center gap-2 p-3 text-sm text-[#64748B]">
                  <User className="w-4 h-4" />
                  <span className="font-medium">
                    {isLoggedIn ? userInfo?.name : '游客'}
                  </span>
                </div>
                {isLoggedIn ? (
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-[#1E293B] hover:bg-[#F9FAFB] cursor-pointer rounded-xl transition-colors"
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    退出登录
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    onClick={handleLogin}
                    className="text-[#1E293B] hover:bg-[#F9FAFB] cursor-pointer rounded-xl transition-colors"
                  >
                    <User className="mr-2 w-4 h-4" />
                    登录
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 移动端菜单按钮 */}
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
