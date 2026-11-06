import { NavLink, Outlet } from 'react-router-dom';
export function AppLayout() {
  return (
    <main className="lab-page">
      <header className="lab-header">
        <NavLink className="brand" to="/">
          flow<span className="brand-light">lab</span>
        </NavLink>
        <nav aria-label="頁面導覽">
          <NavLink
            end
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            圖形渲染比較
          </NavLink>
          <NavLink
            to="/fallback-test"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            錯誤回退測試
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
