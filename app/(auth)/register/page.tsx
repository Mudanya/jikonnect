"use client";
import {
  User,
  Mail,
  Phone,
  MapPin,
  EyeOff,
  Eye,
  Briefcase,
  Award,
  DollarSign,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AuthLayoutContext } from "../layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";

const Register = () => {
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "client",
    // Professional specific
    category: "",
    experience: "",
    hourlyRate: "",
    location: "",
    bio: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const categories = [
    "Cleaning",
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Home Care",
    "Gardening",
    "Other",
  ];
  const { setHeaderDesc } = useContext(AuthLayoutContext);
  useEffect(() => {
    setHeaderDesc({
      title: "Create your account and get started",
      classWidth: "max-w-5xl",
      classFlex: "py-12 px-4",
    });
  }, [setHeaderDesc]);
  return (
    <>
      {/* User Type Selection */}
      <div className="bg-white rounded-2xl shadow-xl  border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-lg mb-4 text-center">I want to:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setSignUpData({ ...signUpData, userType: "client" })}
            className={`p-6 rounded-xl border-2 transition cursor-pointer ${
              signUpData.userType === "client"
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
            onClick={() =>
              setSignUpData({ ...signUpData, userType: "professional" })
            }
            className={`p-6 rounded-xl border-2 transition cursor-pointer ${
              signUpData.userType === "professional"
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
                value={signUpData.fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSignUpData({ ...signUpData, fullName: e.target.value })
                }
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
                value={signUpData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSignUpData({ ...signUpData, email: e.target.value })
                }
                placeholder="your.email@example.com"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                type="tel"
                value={signUpData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSignUpData({ ...signUpData, phone: e.target.value })
                }
                placeholder="+254 700 000000"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {signUpData.userType === "professional" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  value={signUpData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSignUpData({ ...signUpData, location: e.target.value })
                  }
                  placeholder="Nairobi, Kenya"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                value={signUpData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSignUpData({ ...signUpData, password: e.target.value })
                }
                placeholder="Create a password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
                type={showPassword ? "text" : "password"}
                value={signUpData.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSignUpData({
                    ...signUpData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm your password"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Professional-specific fields */}
        {signUpData.userType === "professional" && (
          <div className="mt-6 pt-6 border-t space-y-6">
            <h3 className="font-bold text-lg">Professional Details</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Category
                </label>
                <div className="relative">
                  <Briefcase
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <Select
                    value={signUpData.category}
                    onValueChange={(value) => {
                      setSignUpData({ ...signUpData, category: value });
                    }}
                  >
                    <SelectTrigger className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select category</SelectLabel>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
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
                    value={signUpData.experience}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSignUpData({
                        ...signUpData,
                        experience: e.target.value,
                      })
                    }
                    placeholder="5"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                    value={signUpData.hourlyRate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSignUpData({
                        ...signUpData,
                        hourlyRate: e.target.value,
                      })
                    }
                    placeholder="800"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio / Description
              </label>
              <Textarea
                value={signUpData.bio}
                onChange={(value) =>
                  setSignUpData({
                    ...signUpData,
                    bio: value as unknown as string,
                  })
                }
                placeholder="Tell clients about your experience and expertise..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="flex items-start">
            <Input
              type="checkbox"
              className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <button className="text-blue-600 hover:underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-blue-600 hover:underline">
                Privacy Policy
              </button>
            </span>
          </label>
        </div>

        <button className="w-full cursor-pointer mt-6 bg-linear-to-r from-purple-700 to-blue-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition transform hover:-translate-y-0.5">
          Create Account
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
