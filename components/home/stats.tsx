import { CheckCircle, Star, TrendingUp, Users } from "lucide-react"

const Stats = () => {
  return (
     <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, number: '10,000+', label: 'Active Professionals' },
              { icon: Star, number: '50,000+', label: 'Happy Customers' },
              { icon: CheckCircle, number: '100,000+', label: 'Jobs Completed' },
              { icon: TrendingUp, number: '4.8/5', label: 'Average Rating' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-linear-to-br from-blue-100 to-cyan-100 rounded-xl mb-3">
                  <stat.icon className="text-blue-600" size={24} />
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