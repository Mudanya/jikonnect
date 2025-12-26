"use client";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { SidebarTrigger } from "../ui/sidebar";
import { useEffect, useState } from "react";
import { set } from "zod";
import { User } from "@/types/auth";
import { NotificationBell } from "../notifications/NotificationBell";
import { ChatIcon } from "../chat/ChatIcon";

const AppNavBar = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setTimeout(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    }, 0);
  }, []);
  return (
    <div className="w-full from-jiko-secondary/10  to-jiko-primary/10 backdrop-blur-md bg-linear-to-b border-b fixed top-0 z-40 shadow-md">
      <div className="mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <Image
                src={"/assets/images/jiko-logo-lg.png"}
                alt="Jikonnect logo"
                width={800}
                height={600}
                className="w-auto h-12 hidden md:block"
              />
              <Image
                src={"/assets/images/jiko-logo-sm.png"}
                alt="Jikonnect logo"
                width={800}
                height={600}
                className="w-auto h-12 md:hidden"
              />

              <SidebarTrigger className="cursor-pointer" />
            </div>
            <p className="text-xs text-gray-500 capitalize text-end me-12">
              Welcome back, {user?.firstName.toLowerCase()}!
            </p>
          </div>
          <div className="flex items-center md:space-x-4 space-x-1">
            <ChatIcon />
            <NotificationBell />
            {/* <div className="relative p-2 rounded-lg">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="link"
                    className="p-0! m-0! flex items-center cursor-pointer hover:bg-transparent w-fit h-fit"
                  >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mt-2 bg-gray-100 p-4 rounded me-2"
                  align="start"
                >
                  <DropdownMenuLabel>Notification</DropdownMenuLabel>
                  <DropdownMenuSeparator className="border border-gray-200" />
                  <DropdownMenuItem className="cursor-pointer mt-2">
                    All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
            <Link
              href="/profile"
              className="w-10 h-10 bg-linear-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-2xl cursor-pointer"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-linear-to-br from-jiko-primary/80 via-jiko-primary/70 to-jiko-secondary/70 rounded-full flex items-center justify-center text-white text-lg">
                  {user?.firstName[0]}
                  {user?.lastName[0]}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNavBar;
