"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
 
  Mail,
  Phone,
  Calendar,
  Loader,
} from "lucide-react";
import {
  loadVerifications,
  submitVerification,
} from "@/services/admin.service";
import { toast } from "sonner";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Label } from "@radix-ui/react-select";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types/auth";
const VerificationPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState<{user:User,id:string} | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    setTimeout(async () => {
      setMounted(true);
      if (user?.role !== "ADMIN") {
        router.push("/services");
      } else {
        const res = await loadVerifications();
        console.log(res);
        if (res?.success) {
          setVerifications(res.data);
          setLoading(false);
        } else toast.error(res?.message);
      }
    }, 0);
  }, [user]);

  const handleAction = async (
    profileId: string,
    action: "approve" | "reject"
  ) => {
    if (action === "reject" && !rejectionReason) {
      alert("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const data = await submitVerification(action, profileId, rejectionReason);
      if (data.success) {
        setSelectedProfile(null);
        setRejectionReason("");
        loadVerifications();
      } else toast.error(data.message);
    } catch (err) {
      console.error("Failed to update verification:", err);
    } finally {
      setActionLoading(false);
    }
  };
  if (!mounted || loading) {
    return <Loading />;
  }
  return (
    <div className="min-h-screen ">
      <div className="max-full mx-auto px-4 py-8">
        {verifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600">
              No pending verifications at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {verifications.map((profile: any) => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl shadow-sm border p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-linear-to-br from-jiko-primary/80 via-jiko-primary/70 to-jiko-secondary/70 rounded-full flex items-center justify-center text-white text-2xl">
                      {profile.user.firstName[0]}
                      {profile.user.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {profile.user.firstName} {profile.user.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Mail size={14} className="mr-1" />
                          {profile.user.email}
                        </span>
                        <span className="flex items-center">
                          <Phone size={14} className="mr-1" />
                          {profile.user.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Pending
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">ID Number</p>
                    <p className="font-semibold text-gray-900">
                      {profile.idNumber}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">
                      {profile.location || "Not specified"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">
                      Years of Experience
                    </p>
                    <p className="font-semibold text-gray-900">
                      {profile.yearsOfExperience || 0} years
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                    <p className="font-semibold text-gray-900">
                      KES {profile.hourlyRate?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map((service: string) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {profile.bio && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-sm text-gray-700">{profile.bio}</p>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  {profile.idDocument && (
                    <a
                      href={profile.idDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                    >
                      <FileText size={18} />
                      <span>View ID Document</span>
                    </a>
                  )}

                  {profile.certificates.length > 0 && (
                    <Button className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">
                      <FileText size={18} />
                      <span>{profile.certificates.length} Certificate(s)</span>
                    </Button>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t flex items-center space-x-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedProfile(profile)}
                        className="flex-1 flex items-center cursor-pointer justify-center space-x-2 px-4 py-3 bg-red-50 hover:text-red-700 text-red-700 rounded-xl hover:bg-red-100 transition font-semibold"
                      >
                        <XCircle size={20} />
                        <span>Reject</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {" "}
                          <h3 className="text-xl font-bold mb-4">
                            Reject Verification
                          </h3>
                        </DialogTitle>
                        <DialogDescription>
                          <p className="text-gray-600 mb-4">
                            Please provide a reason for rejecting{" "}
                            {selectedProfile?.user.firstName}'s verification:
                          </p>
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        placeholder="E.g., ID document is not clear, information doesn't match..."
                      />
                      <DialogFooter>
                        <DialogClose asChild className="flex space-x-4">
                          <Button
                            variant="outline"
                            className="cursor-pointer flex-1 px-4 py-3 "
                            onClick={() => {
                              setSelectedProfile(null);
                              setRejectionReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          onClick={() =>
                            handleAction(selectedProfile!.id, "reject")
                          }
                          disabled={actionLoading || !rejectionReason}
                          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading ? "Rejecting..." : "Confirm Reject"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={() => handleAction(profile.id, "approve")}
                    disabled={actionLoading}
                    className="flex-1 cursor-pointer flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold disabled:opacity-50"
                  >
                    <CheckCircle size={20} />
                    <span>{actionLoading ? "Approving..." : "Approve"}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
