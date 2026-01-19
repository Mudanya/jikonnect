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
  AlertCircle,
  MessageCircle,
  Send,
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
import { set } from "zod";

const VerificationPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<any>([]);
  const [selectedProfile, setSelectedProfile] = useState<{
    user: User;
    id: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    setTimeout(async () => {
      setMounted(true);
      console.log("User ", JSON.stringify(user));
      if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
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
  }, []);

  const handleAction = async (
    profileId: string,
    action: "approve" | "reject"
  ) => {
    if (action === "reject" && !rejectionReason) {
      toast.warning("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const data = await submitVerification(
        action,
        profileId,
        selectedProfile!.user.id,
        rejectionReason
      );
      if (data.success) {
        setSelectedProfile(null);
        setRejectionReason("");
        const verData = await loadVerifications();
        if (verData?.success) {
          setVerifications(verData.data);
        }
        toast.success("Verification updated successfully");
      } else toast.error(data.message);
    } catch (err) {
      console.error("Failed to update verification:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Generate missing items message
  const getMissingItemsMessage = (profile: any) => {
    const missing = [];
    if (!profile.idNumber) missing.push("ID Number");
    if (!profile.idDocument) missing.push("ID Document");
    return missing;
  };

  // Generate WhatsApp link
  const getWhatsAppLink = (profile: any) => {
    const missing = getMissingItemsMessage(profile);
    const message = `Hello ${profile.user.firstName},

This is a reminder from JiKonnect regarding your provider verification.

We noticed that your verification is incomplete. The following items are missing:
${missing.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Please update your profile with the missing information to complete your verification process.

To update:
1. Log in to your JiKonnect account
2. Go to your Profile
3. Add the missing information
4. Submit for verification

If you need any assistance, please don't hesitate to reach out.

Best regards,
JiKonnect Verification Team`;

    // Format phone number for WhatsApp (remove + and spaces)
    const phoneNumber = profile.user.phone.replace(/[\s+]/g, '');
    
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  // Generate Email link
  const getEmailLink = (profile: any) => {
    const missing = getMissingItemsMessage(profile);
    const subject = "JiKonnect - Complete Your Provider Verification";
    const body = `Dear ${profile.user.firstName} ${profile.user.lastName},

We hope this email finds you well.

We noticed that your provider verification on JiKonnect is incomplete. To complete your verification and start receiving service requests, please provide the following missing information:

${missing.map((item, i) => `${i + 1}. ${item}`).join('\n')}

HOW TO COMPLETE YOUR VERIFICATION:

1. Log in to your JiKonnect account at https://jikonnect.co.ke
2. Navigate to your Profile section
3. Add the missing information listed above
4. Submit your profile for verification

Once we receive the complete information, we will review and verify your profile within 24-48 hours.

WHY THIS IS IMPORTANT:

Complete verification helps us:
- Ensure trust and safety for our clients
- Provide you with more service opportunities
- Build credibility for your professional profile

If you have any questions or need assistance completing your verification, please reply to this email or contact our support team.

We look forward to having you as a verified provider on JiKonnect!

Best regards,
JiKonnect Verification Team

---
This is an automated reminder from JiKonnect
Website: https://jikonnect.co.ke
Support: support@jikonnect.co.ke`;

    return `mailto:${profile.user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!mounted || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen ">
      <div className="max-full mx-auto px-4 py-8">
        {verifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border  p-2 md:p-12 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600">
              No pending verifications at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {verifications?.map((profile: any) => {
              // Check if verification can be processed
              const canProcess = profile.idNumber && profile.idDocument;
              const missingItems = getMissingItemsMessage(profile);
              
              return (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl shadow-sm border p-6"
                >
                  <div className="flex md:flex-row flex-col items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="md:w-16 md:h-16 h-8 w-8 bg-linear-to-br from-jiko-primary/80 via-jiko-primary/70 to-jiko-secondary/70 rounded-full flex items-center justify-center text-white text-base md:text-2xl">
                        {profile.user.firstName[0]}
                        {profile.user.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {profile.user.firstName} {profile.user.lastName}
                        </h3>
                        <div className="flex flex-col md:flex-row items-center space-x-4 text-sm text-gray-600 mt-1">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">ID Number</p>
                      <p className="font-semibold text-gray-900">
                        {profile.idNumber || (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertCircle size={16} />
                            Missing
                          </span>
                        )}
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
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {profile?.services?.map(
                        (service: {
                          name: string;
                          id: string;
                          pricingType: string;
                          fixedPrice?: number;
                          hourlyRate?: number;
                        }) => (
                          <span
                            key={service.id}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {service.name} • {service.pricingType} •{" "}
                            {service.fixedPrice
                              ? `KES ${service.fixedPrice}`
                              : `KES ${service.hourlyRate}/hr`}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Bio</p>
                      <p className="text-sm text-gray-700">{profile.bio}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    {profile.idDocument ? (
                      <a
                        href={profile.idDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                      >
                        <FileText size={18} />
                        <span>View ID Document</span>
                      </a>
                    ) : (
                      <div className="flex w-full md:w-fit items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg">
                        <AlertCircle size={18} />
                        <span>ID Document Missing</span>
                      </div>
                    )}

                    {profile.certificates.length > 0 && (
                      <Button className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">
                        <FileText size={18} />
                        <span>{profile.certificates.length} Certificate(s)</span>
                      </Button>
                    )}
                  </div>

                  {/* Warning for missing documents with reminder shortcuts */}
                  {!canProcess && (
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
                        <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
                        <div className="text-sm text-amber-800 flex-1">
                          <p className="font-semibold mb-1">Incomplete Verification</p>
                          <p className="mb-2">
                            Missing: {missingItems.join(", ")}. Cannot process verification until all required information is provided.
                          </p>
                          <p className="text-xs text-amber-700">
                            Send a reminder to the provider:
                          </p>
                        </div>
                      </div>
                      
                      {/* Reminder Action Buttons */}
                      <div className="flex flex-col md:flex-row items-center gap-3">
                        <a
                          href={getWhatsAppLink(profile)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="md:flex-1 flex w-full md:w-fit items-center justify-center space-x-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition font-medium"
                          onClick={() => toast.success("Opening WhatsApp...")}
                        >
                          <MessageCircle size={18} />
                          <span>Send WhatsApp Reminder</span>
                        </a>
                        
                        <a
                          href={getEmailLink(profile)}
                          className="md:flex-1 flex w-full md:w-fit items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium"
                          onClick={() => toast.success("Opening email client...")}
                        >
                          <Send size={18} />
                          <span>Send Email Reminder</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t flex flex-col md:flex-row gap-2 md:gap-0 items-center space-x-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedProfile(profile)}
                          disabled={!canProcess || actionLoading}
                          className="md:flex-1 flex items-center w-full md:w-fit cursor-pointer justify-center space-x-2 px-4 py-3 bg-red-50 hover:text-red-700 text-red-700 rounded-xl hover:bg-red-100 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle size={20} />
                          <span>Reject</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="md:max-w-106.25">
                        <DialogHeader>
                          <DialogTitle>
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
                            onClick={() => {
                              handleAction(selectedProfile!.id, "reject");
                            }}
                            disabled={actionLoading || !rejectionReason}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading ? "Rejecting..." : "Confirm Reject"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      onClick={() => {
                        setSelectedProfile(profile);
                        handleAction(profile.id, "approve");
                      }}
                      disabled={!canProcess || actionLoading}
                      className="md:flex-1 w-full md:w-fit cursor-pointer flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={20} />
                      <span>{actionLoading ? "Approving..." : "Approve"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;