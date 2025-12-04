import AppNavBar from "@/components/layout/app-navbar";
import AppSidebar from "@/components/layout/app-sidebar";
import JiKonnectLoader from "@/components/shared/JikonnectLoader";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppNavBar />
        <AppSidebar />
        
        <main className="p-8 mt-24 w-full from-jiko-primary/5 via-jiko-primary/8 to-jiko-secondary/5 backdrop-blur-md bg-linear-to-br">{children}</main>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
