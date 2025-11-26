"use client";
import { SidebarItems } from "@/lib/sidebar-items";
import { LogOutIcon } from "lucide-react";
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

const AppSidebar = () => {
  const pathName = usePathname();
  const { logout } = useAuth();
  return (
    <Sidebar className="mt-18 h-[100vh-72px] shrink-0">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathName == item.url}
                    size="lg"
                    className="data-[active=true]:bg-linear-to-r data-[active=true]:from-jiko-primary data-[active=true]:to-jiko-secondary data-[active=true]:text-white"
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
              className="text-red-500 cursor-pointer hover:text-red-500 hover:bg-red-50"
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
