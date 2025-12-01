"use client";
import { SidebarAdminItems, SidebarClientItems, SidebarProviderItems } from "@/lib/sidebar-items";
import { LogOutIcon, LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const AppSidebar = () => {
  const pathName = usePathname();
  const { logout,user } = useAuth();
  const [sidebarItems, setSidebarItems] = useState<{title:string,url:string,icon:LucideIcon}[]>([])
  useEffect(() =>{
    setTimeout(()=>{
      if(user?.role === 'ADMIN') setSidebarItems(SidebarAdminItems)
        else if(user?.role === 'PROFESSIONAL') setSidebarItems(SidebarProviderItems)
      else setSidebarItems(SidebarClientItems)
    },0)
  },[sidebarItems,user?.role])
  return (
    <Sidebar className="mt-24 bg-jiko-primary! h-[100vh-136px] shrink-0">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathName == item.url}
                    size="lg"
                    className="data-[active=true]:bg-jiko-secondary text-white  data-[active=true]:text-gray-500"
                    asChild
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="w-full">
            <SidebarMenuButton
              className="text-red-500 group cursor-pointer hover:text-red-500 bg-red-50 hover:bg-red-200"
              onClick={() => logout()}
            >
              <LogOutIcon />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
