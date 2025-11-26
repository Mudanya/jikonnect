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

const AppNavBar = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setTimeout(() => {
      if (window !== undefined) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      }
    }, 0);
  }, []);
  return (
    <div className="w-full bg-white border-b fixed top-0 z-40 shadow-sm">
      <div className="mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-r from-jiko-primary to-jiko-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Ji</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Jikonnect</h1>
              <p className="text-xs text-gray-500 capitalize">
                Welcome back, {user?.firstName.toLowerCase()}!
              </p>
            </div>
            <SidebarTrigger className="cursor-pointer" />
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative p-2 rounded-lg">
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
            </div>
            <Link
              href="/dashboard/profile"
              className="w-10 h-10 bg-linear-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-2xl cursor-pointer"
            >
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                "👩🏾"
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNavBar;
