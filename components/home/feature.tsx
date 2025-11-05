import { Shield, Star, Clock, CheckCircle } from "lucide-react";

const Feature = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Professionals",
      desc: "All service providers undergo strict ID and credential verification",
    },
    {
      icon: Star,
      title: "Trusted Ratings",
      desc: "Transparent reviews from real customers guide your choice",
    },
    {
      icon: Clock,
      title: "Quick Booking",
      desc: "Book services in under 2 minutes with instant confirmation",
    },
    {
      icon: CheckCircle,
      title: "Secure Payments",
      desc: "Safe M-Pesa integration with escrow protection",
    },
  ];

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose JiKonnect?
          </h2>
          <p className="text-xl text-gray-600">
            Trust, convenience, and quality in every connection
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 hover:border-blue-200"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature;
