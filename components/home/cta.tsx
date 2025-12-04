import { LandingPageData } from "@/types/service.type"
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

const Cta = ({data}:{data:LandingPageData | null}) => {
  return (
    
      <section id="join" className="py-20 bg-linear-to-b from-jiko-primary/30  to-jiko-secondary text-jiko-primary px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-jiko-primary mb-10">Join thousands of satisfied customers and verified professionals on JiKonnect</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href={'/services'} className="group bg-white text-jiko-primary shadow-md px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center">
              Find a Professional
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={20} />
            </Link>
            <Link href={'/register?role=pro'} className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition">
              Become a Professional
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-jiko-primary">
            <div className="flex items-center space-x-2">
              <Phone size={16} />
              <span>{data?.platform?.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={16} />
              <span>{data?.platform?.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={16} />
              <span>Nairobi, Kenya</span>
            </div>
          </div>
        </div>
      </section>

  )
}

export default Cta