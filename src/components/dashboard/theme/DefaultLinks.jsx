import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const DefaultLinks = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className={`
              h-14 w-14 rounded-full
              bg-primary hover:bg-primary/90
              shadow-lg hover:shadow-xl
              transform transition-all duration-200 ease-in-out
              ${isOpen ? 'rotate-45 scale-110' : 'rotate-0 scale-100'}
              hover:scale-105 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              dark:focus:ring-offset-gray-900
            `}
          >
            <Plus className="h-6 w-6 transition-transform duration-200" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={`
            w-48 p-1
            transform transition-all duration-200 ease-in-out
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
            data-[side=bottom]:slide-in-from-top-2
            data-[side=top]:slide-in-from-bottom-2
          `}
        >
          <Link to="/dashboard/income" className="block">
            <DropdownMenuItem className="
              flex items-center gap-2 p-3
              rounded-md cursor-pointer
              transition-colors duration-200
              hover:bg-primary/10 focus:bg-primary/10
              outline-none
            ">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Income
            </DropdownMenuItem>
          </Link>
          <Link to="/dashboard/expenses" className="block">
            <DropdownMenuItem className="
              flex items-center gap-2 p-3
              rounded-md cursor-pointer
              transition-colors duration-200
              hover:bg-primary/10 focus:bg-primary/10
              outline-none
            ">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              Expenses
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DefaultLinks;