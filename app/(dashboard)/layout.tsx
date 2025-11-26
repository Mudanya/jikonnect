import AppNavBar from "@/components/layout/app-navbar";
import AppSidebar from "@/components/layout/app-sidebar";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppNavBar />
        <AppSidebar />
        <main className="p-8 mt-18 w-full">{children}</main>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
