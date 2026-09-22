import React, { memo, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AppProvider } from '../store/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Editor } from '../components/Editor';
import { AllNotes } from '../pages/AllNotes';
import { AllGroups } from '../pages/AllGroups';
import { GroupNotes } from '../pages/GroupNotes';
import { Toaster } from '../components/Toaster';

const DashboardContent = memo(function DashboardContent({ pathname }: { pathname: string }) {
  const content = useMemo(() => {
  if (pathname === "/dashboard/all-notes") {
    return <AllNotes />;
  }

  if (pathname === "/dashboard/all-groups") {
    return <AllGroups />;
  }

  if (pathname.startsWith("/dashboard/group/")) {
    return <GroupNotes />;
  }

  return <Editor />;
}, [pathname]);

  return (
    <AppProvider>
      <div className="flex h-screen w-full bg-surface overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 flex min-w-0 min-h-0 relative h-full overflow-hidden">
          {content}
        </main>
        <Toaster />
      </div>
    </AppProvider>
  );
});

export function DashboardLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // if (user?.onboardingCompleted !== true) {
  //   return <Navigate to="/onboarding" replace />;
  // }

  return <DashboardContent pathname={location.pathname} />;
}
