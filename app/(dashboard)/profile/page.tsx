"use client";
import EditProfile from "@/components/dashboard/edit-profile";
import GenProfile from "@/components/dashboard/profile";
import { useEffect, useState } from "react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  let edit: string | null = null;
  if (typeof window !== "undefined") {
    edit = localStorage.getItem("isEditing");
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      if (edit && edit === "true") {
        setIsEditing(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [edit]);
  const updateEditing = (value: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("isEditing", value ? "true" : "false");
    setIsEditing(value);
  };
  if (isEditing) {
    return <EditProfile onClickEdit={() => updateEditing(false)} />;
  }
  return <GenProfile onClickEdit={() => updateEditing(true)} />;
};

export default Profile;
