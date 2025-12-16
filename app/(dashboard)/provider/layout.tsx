import ProtectedRoute from "@/components/shared/ProtectedRoute";

const ProviderLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["PROFESSIONAL"]}>{children}</ProtectedRoute>
  );
};

export default ProviderLayout;
