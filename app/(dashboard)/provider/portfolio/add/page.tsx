'use client'
import { redirect } from "next/navigation";

import { PortfolioAddForm } from "@/components/dashboard/portfolio-add-form";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const AddPortfolioPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ id: string }>({ id: "" });
  useEffect(() => {
    setTimeout(async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/provider/portfolio/" + user?.id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prof = await response.json()
      setProfile({ id: prof.data.id || "" });
    }, 0);
  });

  if (!profile) {
    redirect("/provider/onboarding");
  }
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Portfolio Item</h1>
        <p className="text-muted-foreground mt-2">
          Showcase your best work to attract more clients
        </p>
      </div>

      <PortfolioAddForm profileId={profile.id} />
    </div>
  );
};

export default AddPortfolioPage
