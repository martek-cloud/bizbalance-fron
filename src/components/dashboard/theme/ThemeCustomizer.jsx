import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings, WalletCards, Car, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

function ThemeCustomizer() {
  const navItems = [
    // { title: "Income", icon: WalletCards, href: "/dashboard/income" },
    { title: "Business", icon: Briefcase, href: "/dashboard/business" },
    { title: "Vehicle", icon: Car, href: "/dashboard/vehicle" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="border bg-stone-50 dark:bg-stone-800 fixed md:-end-10 end-0  top-1/2   z-40 translate-y-1/2 bg-default-800 dark:bg-default-300 dark:text-default-800 text-default-50   transform rotate-90 flex items-center text-sm font-medium px-2 py-2 shadow-md rounded"
        >
          <Settings className=" text-lg animate-spin" />
          <span className="hidden md:inline-block  ms-2.5">Settings</span>
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="mt-7">
          <SheetTitle className="text-2xl font-bold text-orange-800 mb-6">
            Settings Panel
          </SheetTitle>
          <nav className="grid grid-cols-2 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="flex flex-col justify-center items-center p-4 rounded-lg
        bg-stone-300 dark:bg-stone-800 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="group flex flex-col items-center">
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium mt-2 group-hover:scale-105 transition-transform duration-200">
                    {item.title}
                  </span>
                </div>
              </Link>
            ))}
          </nav>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

export default ThemeCustomizer;
