import ProtectedRoute from "@/components/shared/ProtectedRoute";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute allowedRoles={["CLIENT"]}>{children}</ProtectedRoute>;
};

export default ClientLayout;
