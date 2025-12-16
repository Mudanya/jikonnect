"use client";
import { LocationDropdown } from "@/components/locations/LocationDropdown";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterFormData, registerSchema } from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Award,
  Briefcase,
  DollarSign,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthLayoutContext } from "../layout";

const Register = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    shouldUnregister: true,
  });
  const params = useSearchParams();
  const role = params.get("role");
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const onSubmit = async (data: RegisterFormData) => {
    try {
      if (!data.acceptTerms) {
        toast.warning("Please accept terms and data privacy to proceed");
        return;
      }
      await registerUser(data);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState<boolean>(true);

  const { setHeaderDesc } = useContext(AuthLayoutContext);

  useEffect(() => {
    setHeaderDesc({
      title: "Create your account and get started",
      classWidth: "max-w-5xl",
      classFlex: "py-12 px-4",
    });
    const isRoleClient = role !== "pro";

    setValue("role", !isRoleClient ? "PROFESSIONAL" : "CLIENT", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setTimeout(() => {
      setIsClient(isRoleClient);
    });
  }, []);

  return (
    <Suspense>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* User Type Selection */}
        <div className="bg-white rounded-2xl shadow-xl  border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 text-center">I want to:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setIsClient(true);
                setValue("role", "CLIENT");
              }}
              className={`p-6 rounded-xl border-2 transition cursor-pointer ${
                isClient
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            >
              <div className="text-4xl mb-3">🔍</div>
              <h4 className="font-bold text-lg mb-2">Find Services</h4>
              <p className="text-sm text-gray-600">
                Book professionals for home services
              </p>
            </button>
            <button
              onClick={() => {
                setIsClient(false);
                setValue("role", "PROFESSIONAL", {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              className={`p-6 rounded-xl border-2 transition cursor-pointer ${
                !isClient
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            >
              <div className="text-4xl mb-3">💼</div>
              <h4 className="font-bold text-lg mb-2">Offer Services</h4>
              <p className="text-sm text-gray-600">
                Become a professional service provider
              </p>
            </button>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  {...register("fullName")}
                  placeholder="John Doe"
                  className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName && "border-red-300"
                  }`}
                />
              </div>
              {errors.fullName && (
                <small className="text-xs text-red-300">
                  {errors.fullName.message}
                </small>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="your.email@example.com"
                  className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email && "border-red-300"
                  }`}
                />
              </div>
              {errors.email && (
                <small className="text-xs text-red-300">
                  {errors.email.message}
                </small>
              )}
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
                  type="tel"
                  {...register("phone")}
                  placeholder="+254 700 000000"
                  className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone && "border-red-300"
                  }`}
                />
              </div>
              {errors.phone && (
                <small className="text-xs text-red-300">
                  {errors.phone.message}
                </small>
              )}
            </div>

            {!isClient && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
               
                <LocationDropdown
                  value={getValues("location")}
                  onChange={(locId) => {
                    setValue("location", locId, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                  required={errors.location !== undefined}
                />
              
                {errors.location && (
                  <small className="text-xs text-red-300">
                    {errors.location.message}
                  </small>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Create a password"
                  className={`w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password && "border-red-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <small className="text-xs text-red-300">
                  {errors.password.message}
                </small>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type={"password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                  className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword && "border-red-300"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <small className="text-xs text-red-300">
                  {errors.confirmPassword.message}
                </small>
              )}
            </div>
          </div>

          {/* Professional-specific fields */}
          {!isClient && (
            <div className="mt-6 pt-6 border-t space-y-6">
              <h3 className="font-bold text-lg">Professional Details</h3>

              <div className="grid md:grid-cols-2 gap-6">

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
                      {...register("experience")}
                      placeholder="5"
                      className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.experience && "border-red-300"
                      }`}
                    />
                  </div>
                  {errors.experience && (
                    <small className="text-xs text-red-300">
                      {errors.experience.message}
                    </small>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hourly Rate (KES)
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <Input
                      type="number"
                      {...register("hourlyRate")}
                      placeholder="800"
                      className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.hourlyRate && "border-red-300"
                      }`}
                    />
                  </div>
                  {errors.hourlyRate && (
                    <small className="text-xs text-red-300">
                      {errors.hourlyRate.message}
                    </small>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio / Description
                </label>
                <Textarea
                  {...register("bio")}
                  placeholder="Tell clients about your experience and expertise..."
                  rows={4}
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bio && "border-red-300"
                  }`}
                />
              </div>
              {errors.bio && (
                <small className="text-xs text-red-300">
                  {errors.bio.message}
                </small>
              )}
            </div>
          )}

          <div className="mt-6">
            <label className="flex items-start">
              <Input
                {...register("acceptTerms")}
                type="checkbox"
                className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => {
                    router.push("/terms");
                  }}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => {
                    router.push("/privacy-policy");
                  }}
                >
                  Privacy Policy
                </button>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="disabled:opacity-30 disabled:cursor-not-allowed w-full cursor-pointer mt-6 bg-jiko-primary  text-white py-3 rounded-xl font-bold hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            {isSubmitting ? "Submitting ..." : "Create Account"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 cursor-pointer font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </form>
    </Suspense>
  );
};

export default Register;
