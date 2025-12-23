"use client";
import EditProfile from "@/components/dashboard/edit-profile";
import GenProfile from "@/components/dashboard/profile";
import { useEffect, useState } from "react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState<string | null | undefined>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const theEdit = localStorage.getItem("isEditing");
      if (theEdit) setEdit(theEdit);

      if (edit && edit === "true") {
        setIsEditing(true);
      }
      setIsEditing(!!window.location.hash)
    }, 0);
    return () => clearTimeout(timer);
  }, [edit]);
  const updateEditing = (value: boolean) => {
    localStorage.setItem("isEditing", value ? "true" : "false");
    setIsEditing(value);
  };
  if (isEditing) {
    return <EditProfile onClickEdit={() => updateEditing(false)} />;
  }
  return <GenProfile onClickEdit={() => updateEditing(true)} />;
};

export default Profile;
