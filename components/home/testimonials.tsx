import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Grace Mwangi",
      role: "Nairobi",
      text: "Found an amazing nanny through JiKonnect. The verification process gave me peace of mind!",
      rating: 5,
    },
    {
      name: "David Ochieng",
      role: "Kiambu",
      text: "Fixed my plumbing issue within hours. Professional service and fair pricing.",
      rating: 5,
    },
    {
      name: "Sarah Njeri",
      role: "Westlands",
      text: "The best platform for home services in Kenya. Reliable and trustworthy!",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600">
            Real experiences from real people
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((test, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex space-x-1 mb-4">
                {[...Array(test.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="text-yellow-400 fill-yellow-400"
                    size={20}
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                &quot;{test.text}&quot;
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-purple-400 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-900">{test.name}</div>
                  <div className="text-sm text-gray-500">{test.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
