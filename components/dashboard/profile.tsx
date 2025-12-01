"use client";
import { useAuth } from "@/contexts/AuthContext";
import { submitProfile, uploadDocument } from "@/services/apis/profile.api";
import { loadUserProfile } from "@/services/provider.service";
import { User } from "@/types/auth";
import { ProfileFormData } from "@/validators/profile.validator";
import {
  ArrowUp,
  CheckCircle,
  CircleAlert,
  Star,
  TriangleAlert,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "../shared/Loading";
import { Button } from "../ui/button";
import { Combobox } from "../ui/combobox";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const GenProfile = ({ onClickEdit }: { onClickEdit: () => void }) => {
  const { user } = useAuth();
  const [avatar, setAvatarUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ profile: ProfileFormData } | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const data = await loadUserProfile(token || "");

      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };
  const updateProfile = async () => {
    try {
      if (window !== undefined) {
        const theUser = localStorage.getItem("user");
        if (theUser) {
          const storedUser = JSON.parse(theUser) as User;
          const res = await submitProfile({
            ...storedUser,
            ...profile!.profile,
            role: storedUser.role as "CLIENT" | "PROFESSIONAL" | undefined,
            hourlyRate: +(profile?.profile.hourlyRate || 0),
          });
          if (res.success) toast.success("Profile updated successfully");
          setUploading(false);
        }
      }
    } catch (err) {
      setUploading(false);
      toast.error(
        (err as Error).message || "Something went wrong, while updating profile"
      );
    }
  };
  const setService = async (val: string) => {
    setUploading(true);
    if (
      !profile?.profile.services
        .map((s) => s.toLowerCase())
        .includes(val?.toLowerCase())
    ) {
      if (val) {
        setProfile({
          profile: {
            ...profile!.profile,
            services: [...profile!.profile.services, val],
          },
        });
        await updateProfile();
      }
    }
    setUploading(false);
  };
  useEffect(() => {
    setTimeout(async () => {
      if (user && user.role === "PROFESSIONAL") await loadProfile();
      if (window !== undefined) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setAvatarUrl(parsedUser.avatar || null);
        }
      }
    }, 0);
  }, [user]);
  const handleChange = async (event: ChangeEvent<HTMLTextAreaElement>) => {
    setUploading(true);
    const val = event.target.value;
    if (profile?.profile.bio.toLowerCase() !== val?.toLowerCase()) {
      if (val) {
        setProfile({ profile: { ...profile!.profile, bio: val } });
        await updateProfile();
      }
    }
    setUploading(false);
  };

  const handleFileUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    setUploading(true);
    const result = await uploadDocument(event, "avatar");
    if (result && result.success) {
      setAvatarUrl(result.fileUrl);
      setUploading(false);
      toast.success("Avatar updated successfully");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-start space-x-6 mb-8">
          <div className="w-32 h-32  relative rounded-full flex items-center justify-center text-6xl">
            {!avatar && (
              <div className="w-full h-full bg-linear-to-br from-jiko-primary/80 via-jiko-primary/70 to-jiko-secondary/70 rounded-full flex items-center justify-center text-white text-  xl">
                {user?.firstName[0]}
                {user?.lastName[0]}
              </div>
            )}
            {avatar && (
              <Image
                src={avatar}
                alt="Avatar"
                width={128}
                height={128}
                className="rounded-full object-cover w-32 h-32"
              />
            )}
            <Input
              type="file"
              className="hidden"
              id="avatar-upload"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label
              htmlFor="avatar-upload"
              className="absolute hover:scale-110 bottom-0 text-white right-2 bg-linear-to-br from-jiko-primary/80  to-jiko-secondary/70 border-2 border-white p-1 rounded-full cursor-pointer shadow-md"
            >
              <ArrowUp />
            </label>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-3xl font-bold capitalize">
                {user?.firstName?.toLowerCase()} {user?.lastName?.toLowerCase()}{" "}
              </h2>
              {user?.role === "CLIENT" && (
                <CheckCircle className="text-blue-500" size={24} />
              )}
              {user?.role === "PROFESSIONAL" && user.status === "VERIFIED" && (
                <CheckCircle className="text-green-500" size={24} />
              )}
              {user?.role === "PROFESSIONAL" && user.status === "PENDING" && (
                <CircleAlert className="text-orange-500" size={24} />
              )}
              {user?.role === "PROFESSIONAL" && user.status === "REJECTED" && (
                <TriangleAlert className="text-red-500" size={24} />
              )}
            </div>
            {user?.role === "PROFESSIONAL" && (
              <p className="text-gray-600 mb-2">{profile?.profile?.location}</p>
            )}
            {user?.role === "PROFESSIONAL" && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  <span className="font-bold">4.9</span>
                  <span className="text-gray-500">(156 reviews)</span>
                </div>
                <div className="text-gray-500">234 jobs completed</div>
              </div>
            )}
            <Button
              disabled={uploading}
              onClick={onClickEdit}
              className="mt-4 disabled:cursor-not-allowed  bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {user?.role === "PROFESSIONAL" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <Textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                defaultValue={profile?.profile?.bio}
                onBlur={handleChange}
                placeholder="Tell clients about yourself..."
                disabled={uploading}
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile?.profile?.services.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <span>{skill}</span>
                    <X
                      size={14}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={async () => {
                        setUploading(true);
                        setProfile({
                          profile: {
                            ...profile.profile!,
                            services: profile.profile.services.filter(
                              (val) =>
                                val?.toLowerCase() !== skill.toLowerCase()
                            ),
                          },
                        });
                        await updateProfile();
                      }}
                    />
                  </span>
                ))}
              </div>

              <Combobox onValueChange={setService} />
            </div>
          </div>
        )}
        {uploading && <Loading />}
      </div>
    </div>
  );
};

export default GenProfile;
