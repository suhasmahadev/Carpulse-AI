import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import LightRays from "./components/LightRays.jsx";

export default function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentRoute = location.pathname.startsWith('/student');
  const isFacultyRoute = location.pathname.startsWith('/faculty');
  const isHodRoute = location.pathname.startsWith('/hod');

  // These routes have their own sidebar + topbar
  const hasOwnLayout = isAdminRoute || isStudentRoute || isFacultyRoute || isHodRoute;

  useEffect(() => {
    if (isLandingPage) {
      document.body.style.backgroundColor = '#050505';
    } else {
      document.body.style.backgroundColor = 'transparent';
    }
  }, [isLandingPage]);

  // Fully isolate the landing page so ScrollTrigger and Canvas positions aren't disrupted
  if (isLandingPage) {
    return <Outlet key={location.pathname} />;
  }

  return (
    <div className="app-root" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', background: 'transparent' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#FF5A1F"
          raysSpeed={1.5}
          lightSpread={1}
          rayLength={2.5}
          followMouse={true}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!hasOwnLayout && <Header />}
        <main className={hasOwnLayout ? "" : "app-main"} style={{ flex: 1, position: 'relative', zIndex: 11 }}>
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
}
