"use client";

import { UserCircle, LogOut, Copy, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export function UserMenu() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyKey = (e) => {
    e.preventDefault(); // Prevent default dropdown behavior
    e.stopPropagation(); // Prevent event bubbling

    navigator.clipboard
      .writeText(user.comptable_key)
      .then(() => {
        setIsCopied(true);
        toast.success("Accountant key copied to clipboard!");

        // Reset copy icon after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch(() => {
        toast.error("Failed to copy key");
      });
  };
  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleProfile = () => {
    navigate("/profile");
  };
  console.log(user);
  return (
    <>
    
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={user.avatar} alt={user.first_name} />
            <AvatarFallback>
              {user.first_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link to="/dashboard/profile">
          <DropdownMenuItem onClick={handleProfile}>
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          </Link>
          
          {user.comptable_key && (
            <DropdownMenuItem
              onClick={handleCopyKey}
              className="cursor-pointer"
            >
              <Copy className="mr-2 h-4 w-4" />
              <span className="mr-2">Key : {user.comptable_key}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setShowLogoutDialog(true)}
            className="text-red-500 focus:bg-red-50 focus:text-red-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You'll need to log in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
