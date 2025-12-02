import { LandingPageData } from "@/types/service.type"
import { CheckCircle, Star, TrendingUp, Users } from "lucide-react"

const Stats = ({data}:{data:LandingPageData|null}) => {
  return (
     <section className="py-12 bg-white">
        <div className="max-w-[90vw] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: `${data?.stats.totalProviders || 10}+`, label: 'Active Professionals' },
              { icon: Star, number: `${data?.stats.totalBookings || 15}+`, label: 'Happy Customers' },
              { icon: CheckCircle, number: `${data?.stats.completedBookings || 20}+`, label: 'Jobs Completed' },
              { icon: TrendingUp, number: `${data?.stats.averageRating || 4.8}/5`, label: 'Average Rating' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-jiko-secondary/30 rounded-xl mb-3">
                  <stat.icon className="text-jiko-primary" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

  )
}

export default Stats