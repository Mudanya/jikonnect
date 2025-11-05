import Cta from "@/components/home/cta";
import Feature from "@/components/home/feature";
import Footer from "@/components/home/footer";
import HeroSection from "@/components/home/hero-section";
import HowItWorks from "@/components/home/how-it-works";
import Stats from "@/components/home/stats";
import Testimonials from "@/components/home/testimonials";
import Header from "@/components/layout/header";

export default function Home() {
 
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Navigation */}
      <Header />
      {/* Hero Section  */}
      <HeroSection />
      {/* Stats Section */}
      <Stats />
      {/* Features Section */}
      <Feature />
      {/* How It Works Section */}
      <HowItWorks />
      {/* Testimonials Section */}
      <Testimonials />
      {/* Call to Action Section */}
      <Cta />
      {/* Footer Section */}
      <Footer />
    </main>
  );
}
