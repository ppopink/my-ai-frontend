import { Outlet, useNavigate, useLocation } from 'react-router';
import { Home, StickyNote, UserCircle, Code2 } from 'lucide-react';
import { GlobalAgent } from './GlobalAgent';
import { useEffect } from 'react';

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // 全局初始化深色模式：从 localStorage 读取并应用到 html 元素
  useEffect(() => {
    const isDark = localStorage.getItem('lp_dark_mode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const navItems = [
    { icon: Home, label: '首页', path: '/' },
    { icon: StickyNote, label: '笔记', path: '/notes' },
    { icon: UserCircle, label: '我的', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Code2 className="w-7 h-7 text-violet-600 dark:text-violet-400" />
          <span className="text-lg text-violet-700 dark:text-violet-300" style={{ fontWeight: 600 }}>不学编程</span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map(item => {
            const active = item.path === '/' ? path === '/' : path.startsWith(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${active ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Agent */}
      <GlobalAgent />
    </div>
  );
}
