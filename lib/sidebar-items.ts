import { Home, Inbox, Calendar, Search, Settings, Briefcase, DollarSign, Star, User } from "lucide-react";

export const SidebarItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Briefcase,
    role: ''
  },
  {
    title: "My Jobs",
    url: "/my-jobs",
    icon: Calendar,
    role: ''
  },
  {
    title: "Earnings",
    url: "/earnings",
    icon: DollarSign,
    role: ''
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: Star,
    role: ''
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
    role: ''
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    role: ''
  },
]