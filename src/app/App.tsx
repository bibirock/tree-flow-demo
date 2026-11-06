import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { GraphComparisonPage } from '@/pages/graph-comparison/GraphComparisonPage';
import { FallbackTestPage } from '@/pages/fallback-test/FallbackTestPage';
const Router = import.meta.env.BASE_URL === '/' ? BrowserRouter : HashRouter;
export function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<GraphComparisonPage />} />
          <Route path="fallback-test" element={<FallbackTestPage />} />
          <Route path="*" element={<p>找不到頁面</p>} />
        </Route>
      </Routes>
    </Router>
  );
}
