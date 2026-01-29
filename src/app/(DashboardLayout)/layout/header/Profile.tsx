"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import * as profileData from "./data";
import SimpleBar from "simplebar-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/app/context/Appcontext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Profile = () => {
  const { userData, clearUserData } = useAppContext();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    clearUserData();
    setShowLogoutDialog(false);
  };

  return (
    <div className="relative group/menu ps-15 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <Image
              src="/images/profile/user-1.jpg"
              alt="logo"
              height={35}
              width={35}
              className="rounded-full"
            />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-screen sm:w-[280px] pb-4 pt-4 rounded-sm"
        >
          <div className="px-4 pb-4 border-b border-border mb-2">
            <h5 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              User Profile
            </h5>
            <div className="flex items-center gap-3 mt-3">
              <Image
                src="/images/profile/user-1.jpg"
                alt="user profile"
                height={45}
                width={45}
                className="rounded-full"
              />
              <div className="overflow-hidden">
                <h6 className="text-sm font-bold truncate capitalize">
                  {userData?.firstName} {userData?.lastName}
                </h6>
                <p className="text-xs text-muted-foreground truncate">
                  {userData?.email}
                </p>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-lightprimary text-primary font-bold mt-1">
                  {userData?.role}
                </span>
              </div>
            </div>
          </div>
          <SimpleBar className="max-h-[250px]">
            {profileData.profileDD.map((item, index) => (
              <DropdownMenuItem key={index} asChild>
                <Link
                  href={item.url}
                  className="px-4 py-2 flex justify-between items-center group/link w-full hover:bg-lightprimary hover:text-primary"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Icon
                      icon={item.icon}
                      className="text-lg text-muted-foreground group-hover/link:text-primary"
                    />
                    <h5 className="mb-0 text-sm text-muted-foreground group-hover/link:text-primary">
                      {item.title}
                    </h5>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </SimpleBar>

          <DropdownMenuSeparator className="my-2" />

          <div className="px-4 mt-2">
            <Button
              variant="outline"
              className="w-full rounded-md border-primary text-primary hover:bg-primary hover:text-white transition-all"
              onClick={() => setShowLogoutDialog(true)}
            >
              Logout
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account? Any unsaved
              changes may be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="text-white"
              variant="destructive"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
