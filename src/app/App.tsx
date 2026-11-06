import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { GraphComparisonPage } from '@/pages/graph-comparison/GraphComparisonPage';
import { FallbackTestPage } from '@/pages/fallback-test/FallbackTestPage';
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<GraphComparisonPage />} />
          <Route path="fallback-test" element={<FallbackTestPage />} />
          <Route path="*" element={<p>找不到頁面</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
