import { LandingPageData } from "@/types/service.type"
import { CheckCircle, Star, TrendingUp, Users } from "lucide-react"

const Stats = ({data}:{data:LandingPageData|null}) => {
  return (
     <section className="py-12 bg-white">
        <div className="max-w-[90vw] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: `${Math.max(data?.stats.totalProviders || 0, 500)}+`, label: 'Active Professionals' },
              { icon: Star, number: `${Math.max(data?.stats.totalBookings || 0, 1000)}+`, label: 'Happy Customers' },
              { icon: CheckCircle, number: `${Math.max(data?.stats.completedBookings || 0, 1500)}+`, label: 'Jobs Completed' },
              { icon: TrendingUp, number: `${Math.max(data?.stats.averageRating || 4.8, 4.8)}/5`, label: 'Average Rating' }
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