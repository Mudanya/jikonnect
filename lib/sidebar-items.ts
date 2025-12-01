import { Home, Inbox, Calendar, Search, Settings, Briefcase, DollarSign, Star, User, UserRoundCheck, ListTodo, NotebookPen, HandFist, HandCoins, Logs, GalleryVerticalEnd } from "lucide-react";

export const SidebarClientItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: Briefcase,
    role: ''
  },

  {
    title: "Services",
    url: "/services",
    icon: DollarSign,
    role: ''
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: Star,
    role: ''
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
    role: ''
  },

]
export const SidebarAdminItems = [
  {
    title: "Overview",
    url: "/admin",
    icon: Briefcase,
    role: ''
  },
  {
    title: "Verifications",
    url: "/admin/verifications",
    icon: UserRoundCheck,
    role: ''
  },
  {
    title: "Bookings",
    url: "/admin/bookings",
    icon: NotebookPen,
    role: ''
  },
  {
    title: "Disputes",
    url: "/admin/disputes",
    icon: HandFist,
    role: ''
  },
  {
    title: "Revenue",
    url: "/admin/revenue",
    icon: HandCoins,
    role: ''
  },
  {
    title: "Audit Logs",
    url: "/admin/audit-logs",
    icon: Logs,
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
    url: "/admin/settings",
    icon: Settings,
    role: ''
  },
]
export const SidebarProviderItems = [
  {
    title: "Overview",
    url: "/provider/dashboard",
    icon: Briefcase,
    role: ''
  },
  {
    title: "Onboarding",
    url: "/provider/onboarding",
    icon: GalleryVerticalEnd,
    role: ''
  },
  {
    title: "Portfolio",
    url: "/provider/portfolio",
    icon: GalleryVerticalEnd,
    role: ''
  },
  {
    title: "Verification",
    url: "/provider/verification",
    icon: GalleryVerticalEnd,
    role: ''
  },
  {
    title: "Availability",
    url: "/provider/availability",
    icon: GalleryVerticalEnd,
    role: ''
  },
  {
    title: "My Jobs",
    url: "/provider/my-jobs",
    icon: Calendar,
    role: ''
  },
  {
    title: "Earnings",
    url: "/provider/earnings",
    icon: DollarSign,
    role: ''
  },
  {
    title: "Reviews",
    url: "/provider/reviews",
    icon: Star,
    role: ''
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
    role: ''
  },

]