"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  submitProfile,
  submitVerification,
  uploadDocument,
} from "@/services/apis/profile.api";
import { loadUserProfile } from "@/services/provider.service";
import {
  EditProfileFormData,
  editProfileSchema,
} from "@/validators/profile.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Award,
  CheckCircle,
  DollarSign,
  FileText,
  Mail,
  Phone,
  Save,
  Upload,
  User,
} from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { LocationDropdown } from "../locations/LocationDropdown";
import Loading from "../shared/Loading";
import ServicesModal from "../services/ServicesModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const EditProfile = ({ onClickEdit }: { onClickEdit: () => void }) => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },

    getValues,
    reset,

    control,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      avatar: "",
      bio: "",

      yearsOfExperience: undefined,
      location: "",
      languages: [],
      idNumber: "",
      role: "CLIENT",
    },
  });

  const [documents, setDocuments] = useState({
    idDocument: "",
    certificates: [] as string[],
  });

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      await submitProfile(data);
      onClickEdit();
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  useEffect(() => {
    setTimeout(async () => {
      setMounted(true);

      if (user) {
        try {
          const token = localStorage.getItem("accessToken");

          const data = await loadUserProfile(token || "");
          if (data.success) {
            reset(
              {
                firstName: data.data.firstName || "",
                lastName: data.data.lastName || "",
                phone: data.data.phone || "",
                avatar: data.data?.avatar || "",
                bio: data.data?.profile?.bio || "",

                yearsOfExperience: data.data?.profile?.yearsOfExperience || 0,
                languages: data.data?.profile?.languages || [],
                idNumber: data.data?.profile?.idNumber || "",
                role: user.role as
                  | "CLIENT"
                  | "PROFESSIONAL"
                  | "ADMIN"
                  | "SUPER_ADMIN",
                location: data.data?.profile?.locationId,
              },
              {
                keepDirty: false, // Mark form as pristine
                keepTouched: false,
                keepIsValid: false,
              }
            );

            setDocuments({
              idDocument: data.data.profile?.idDocument || "",
              certificates: data.data.profile?.certificates || [],
            });
          }
        } catch (err) {
          toast.error(`Failed to load profile: ${(err as Error).message}`);
        }
      }
    }, 0);
  }, [user, reset]);

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    documentType: "certificate" | "idDocument"
  ) => {
    setUploading(true);
    try {
      const result = await uploadDocument(e, documentType);
      if (result?.success) {
        if (documentType === "idDocument") {
          setDocuments((prev) => ({
            ...prev,
            idDocument: result.fileUrl || "",
          }));
        } else if (documentType === "certificate" && result.fileUrl) {
          setDocuments((prev) => ({
            ...prev,
            certificates: [...prev.certificates, result.fileUrl!],
          }));
        }
        setUploading(false);
      }
    } catch (err) {
    } finally {
      setUploading(false);
    }
  };
  if (!mounted) return <Loading />;
  const handleSubmitVerification = async () => {
    try {
      setUploading(true);
      const verifyRes = await submitVerification(getValues("idNumber") || "");
      if (verifyRes.success) toast.success(verifyRes.message);
      setUploading(false);
    } catch (err) {
      setUploading(false);
      toast.error((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {user?.role === "PROFESSIONAL" && (
        <div className="py-5 flex justify-end">
          <Button
            type="button"
            className="bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer"
            onClick={onClickEdit}
          >
            Cancel
          </Button>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Basic Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                defaultValue={getValues("firstName")}
                type="text"
                {...register("firstName")}
                className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName && "border-red-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                defaultValue={getValues("lastName")}
                type="text"
                {...register("lastName")}
                className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName && "border-red-500"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (Cannot be changed)
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="email"
                defaultValue={user?.email}
                disabled
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                defaultValue={getValues("phone")}
                {...register("phone")}
                className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone}`}
              />
            </div>
          </div>
        </div>
      </div>

      {user?.role === "PROFESSIONAL" && (
        <>
          <div className="bg-white rounded-2xl shadow-md p-6 mt-4">
            <h2 className="text-xl font-bold mb-6">Professional Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio / Description
                </label>
                <Textarea
                  rows={4}
                  defaultValue={getValues("bio")}
                  {...register("bio")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell clients about your experience and expertise..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Services Offered
                </label>
                <ServicesModal />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <LocationDropdown
                        value={field.value}
                        onChange={field.onChange}
                        required={errors.location !== undefined}
                      />
                    )}
                  />

                  {/* <div className="relative">
                    <MapPin
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <Input
                      defaultValue={getValues("location")}
                      type="text"
                      {...register("location")}
                      placeholder="Nairobi, Kenya"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div> */}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <div className="relative">
                    <Award
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <Input
                      type="number"
                      {...register("yearsOfExperience", {
                        valueAsNumber: true,
                      })}
                      placeholder="5"
                      defaultValue={getValues("yearsOfExperience")}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                
              </div>
            </div>
          </div>

          {/* ID & Document Upload */}
          <div
            id="verification"
            className="bg-white rounded-2xl shadow-md p-6 mt-4"
          >
            <h2 className="text-xl font-bold mb-6">
              ID & Document Verification
            </h2>

            <div className="space-y-6">
              {/* ID Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ID Number
                </label>
                <Input
                  defaultValue={getValues("idNumber")}
                  type="text"
                  {...register("idNumber")}
                  placeholder="Enter your national ID number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ID Document Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ID Document
                </label>
                {documents.idDocument ? (
                  <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle className="text-green-600" size={24} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">
                        ID document uploaded
                      </p>
                      <a
                        href={documents.idDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:underline"
                      >
                        View document
                      </a>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition">
                    <Upload className="text-gray-400 mb-2" size={32} />
                    <span className="text-sm text-gray-600">
                      Click to upload ID document
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, PNG, or JPEG (max 5MB)
                    </span>
                    <Input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFileUpload(e, "idDocument")
                      }
                    />
                  </label>
                )}
              </div>

              {/* Certificates Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificates (Optional)
                </label>

                {documents.certificates.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {documents.certificates.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <FileText className="text-gray-600" size={20} />
                        <a
                          href={cert}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex-1"
                        >
                          Certificate {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition">
                  <Upload className="text-gray-400 mb-1" size={24} />
                  <span className="text-sm text-gray-600">Add certificate</span>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFileUpload(e, "certificate")
                    }
                  />
                </label>
              </div>

              {/* Submit Verification Button */}
              {documents.idDocument && getValues("idNumber") && (
                <Button
                  onClick={handleSubmitVerification}
                  type="button"
                  disabled={uploading}
                  className="w-full cursor-pointer bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {uploading ? "Submitting..." : "Submit for Verification"}
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end space-x-4 mt-4">
        <Button
          type="button"
          onClick={onClickEdit}
          className="px-6 py-3 border cursor-pointer border-red-300 rounded-xl font-semibold text-red-700 hover:bg-red-50 bg-transparent"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="px-6 !disabled:cursor-not-allowed py-3 cursor-pointer bg-linear-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center space-x-2"
        >
          <Save size={20} />
          <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>
    </form>
  );
};

export default EditProfile;
