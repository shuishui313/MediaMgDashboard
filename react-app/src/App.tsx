import ThemeToggle from '@/components/dashboard/ThemeToggle';
import ErrorBoundary from '@/components/ErrorBoundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import Routes from '@/routes/Routes';

/**
 * Root Application Component
 * @component MainApp
 */
const MainApp = () => {
  return (
    <ErrorBoundary name="App">
      <TooltipProvider>
        <Routes />
        {/* 壳层右下角：所有路由（含登录页）都能切换主题，不遮挡各页面右上角操作。 */}
        <div className="fixed right-4 bottom-4 z-50">
          <ThemeToggle />
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default MainApp;
