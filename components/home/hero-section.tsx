import { LandingPageData } from "@/types/service.type";
import {
  ArrowRight,
  CheckCircle,
  Heart,
  Home,
  Search,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const HeroSection = ({ data }: { data: LandingPageData | null }) => {
  const services = [
    {
      icon: Wrench,
      title: "Home Services",
      desc: "Plumbing, Electrical, Carpentry",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "Cleaning",
      desc: "Professional home & office cleaning",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Heart,
      title: "Home Care",
      desc: "Nannies, Caregivers, Nurses",
      color: "from-rose-500 to-orange-500",
    },
    {
      icon: Home,
      title: "Décor & Design",
      desc: "Interior design & decoration",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  function handleSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    router.push(`/services?q=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8" id="services">
      <div className="max-w-[90vw] xl:max-w-[1440px] mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-4 px-4 py-2 rounded-full text-jiko-primary text-sm font-medium flex items-center bg-jiko-secondary/15">
              Connecting prople, skills, services and care
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Connecting You to{" "}
              <span className="bg-linear-to-r from-jiko-primary to-jiko-secondary bg-clip-text text-transparent">
                What You Need
              </span>
              , When You Need It
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Verified professionals, trusted home care, and reliable services —
              all at your fingertips. Join 10,000+ satisfied customers across
              Nairobi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href={"/services"}
                className="cursor-pointer group bg-jiko-primary  text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center"
              >
                Find a Professional
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition"
                  size={20}
                />
              </Link>
              <Link
                href={"/register?role=pro"}
                className="cursor-pointer bg-white shadow-md shadow-jiko-primary/10 border-2 border-jiko-secondary text-jiko-secondary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition"
              >
                Join as a Pro
              </Link>
            </div>

            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span>Verified IDs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={20} />
                <span>Real Reviews</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8">
              <div className="mb-6">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center space-x-2 mb-4"
                >
                  <Search className="text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for services..."
                    className="flex-1 outline-none text-gray-700"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                <div className="grid grid-cols-2 gap-3">
                  {data?.serviceCategories &&
                    data?.serviceCategories.map((service, i) => {
                      
                      return (
                        <div
                          onClick={() =>
                            router.push(`/services?category=${service.name}`)
                          }
                          key={i}
                          className="group p-4 rounded-xl bg-linear-to-br hover:shadow-lg transition cursor-pointer border border-gray-100 hover:border-transparent"
                          style={{
                            background: `linear-linear(135deg, ${
                              i % 2 === 0 ? "#f0f9ff" : "#fef3f2"
                            })`,
                          }}
                        >
                          <div
                            className={`w-10 h-10 bg-linear-to-br  rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition`}
                          >
                            <span className="text-2xl">{service.category.icon}</span>
                            {/* <service.category.icon className="text-white" size={20} /> */}
                          </div>
                          <h3 className="font-semibold text-gray-800 text-sm mb-1">
                            {service.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {service.description}
                          </p>
                        </div>
                      );
                    })}
                  {data?.serviceCategories.length === 0 &&
                    services.map((service, i) => {
                      return (
                        <div
                          key={i}
                          className="group p-4 rounded-xl bg-linear-to-br hover:shadow-lg transition cursor-pointer border border-gray-100 hover:border-transparent"
                          style={{
                            background: `linear-linear(135deg, ${
                              i % 2 === 0 ? "#f0f9ff" : "#fef3f2"
                            })`,
                          }}
                        >
                          <div
                            className={`w-10 h-10 bg-linear-to-br ${service.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition`}
                          >
                            <service.icon className="text-white" size={20} />
                          </div>
                          <h3 className="font-semibold text-gray-800 text-sm mb-1">
                            {service.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {service.desc}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-linear-to-br from-jiko-primary to-jiko-secondary rounded-full border-2 border-white"
                        ></div>
                      ))}
                    </div>
                    <span className="text-gray-600 font-medium">
                      {Math.max(data?.stats.verifiedProviders || 0, 400)}+ Verified Pros
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star
                      className="text-yellow-400 fill-yellow-400"
                      size={16}
                    />
                    <span className="font-bold text-gray-800">
                      {data?.stats.averageRating || 4.8}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
