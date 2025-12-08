"use client";
import Cta from "@/components/home/cta";
import Feature from "@/components/home/feature";
import Footer from "@/components/home/footer";
import HeroSection from "@/components/home/hero-section";
import HowItWorks from "@/components/home/how-it-works";
import Stats from "@/components/home/stats";
import Testimonials from "@/components/home/testimonials";
import Header from "@/components/layout/header";
import { getLandingData } from "@/services/apis/booking.api";
import { LandingPageData } from "@/types/service.type";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<LandingPageData | null>(null);
  useEffect(() => {
    setTimeout(async () => {
      try {
        const getData = await getLandingData();
       
        if (getData.success) {
          setData(getData.data);
        }
      } catch (err) {
        // console.log(err);
      }
    }, 0);
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-br from-jiko-primary/15 via-jiko-primary/10 to-jiko-secondary/50">
      
      {/* Navigation */}
      <Header />
     
      {/* Hero Section  */}
      <HeroSection data={data}/>
       
      {/* Stats Section */}
      <Stats data={data}/>
      {/* Features Section */}
      <Feature />
      {/* How It Works Section */}
      <HowItWorks />
      {/* Testimonials Section */}
      <Testimonials data={data}/>
      {/* Call to Action Section */}
      <Cta data={data}/>
      {/* Footer Section */}
      <Footer />
    </main>
  );
}
