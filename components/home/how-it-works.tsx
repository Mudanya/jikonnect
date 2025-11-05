import { ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    { number: "1", title: "Search", desc: "Find the service you need" },
    { number: "2", title: "Select", desc: "Choose a verified professional" },
    { number: "3", title: "Book", desc: "Schedule and pay securely" },
    { number: "4", title: "Rate", desc: "Share your experience" },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 bg-linear-to-br from-blue-600 to-cyan-500 text-white px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How JiKonnect Works</h2>
          <p className="text-xl text-blue-100">
            Getting the help you need is simple
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-blue-600 text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-blue-100">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="text-white/50" size={32} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
