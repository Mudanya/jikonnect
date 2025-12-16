import ProtectedRoute from "@/components/shared/ProtectedRoute";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      {children}
    </ProtectedRoute>
  );
};

export default AdminLayout;
