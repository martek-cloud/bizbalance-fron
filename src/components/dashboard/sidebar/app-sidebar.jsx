import React from "react";
import {
  LayoutDashboard,
  Users,
  UserRoundCog,
  Tags,
  FileStack,
  DollarSign,
  Receipt,
  Car,
  Home,
  FileText,
  BarChart3,
  Settings,
  PlusCircle,
  Calendar,
  FolderTree,
  PieChart,
  Building2,
  Bell,
  Link,
  TrendingUp,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import { NavHeader } from "@/components/dashboard/sidebar/nav-header";
import { NavMain } from "@/components/dashboard/sidebar/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const AppSidebar = (props) => {
  const { user } = useAuthStore();

  const roleType = user?.role_type || "user";

  // Base navigation items
  const baseNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
    },
    {
      title: "Income",
      url: "/dashboard/income",
      icon: DollarSign,
      items: [],
    },
    {
      title: "Expenses",
      icon: Receipt,
      items: [
        {
          title: "Manage Expenses",
          url: "/dashboard/expenses",
          icon: Receipt,
        },
        {
          title: "Expenses Summary",
          url: "/dashboard/expenses/summary",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Profit & Loss",
      url: "/dashboard/profit-loss",
      icon: TrendingUp,
      items: [],
    },
    {
      title: "Settings",
      icon: Settings,
      items: [
        {
          title: "Vehicles",
          url: "/dashboard/vehicle",
          icon: Car,
        },
        {
          title: "Business",
          url: "/dashboard/business",
          icon: Building2,
        },
        {
          title: "Types & Labels",
          url: "/dashboard/types&labels",
          icon: Tags,
        },
      ],
    },
  ];

  // Users navigation based on role
  const getUsersNav = () => {
    if (roleType === "admin") {
      return {
        title: "Admin",
        url: "/dashboard/admin",
        icon: UserRoundCog,
        items: [
          {
            title: "Users",
            url: "/dashboard/users",
            icon: Users,
            items: [],
          },
          {
            title: "Add User",
            url: "/dashboard/users/add",
            icon: PlusCircle,
            items: [],
          },
          {
            title: "Roles & Permissions",
            url: "/dashboard/roles",
            icon: UserRoundCog,
            items: [],
          },
        ],
      };
    } else if (roleType === "comptable") {
      return {
        title: "Admin",
        url: "/dashboard/admin",
        icon: UserRoundCog,
        items: [
          {
            title: "My Users",
            url: "/dashboard/users",
            icon: Users,
            items: [],
          },
          {
            title: "Add User",
            url: "/dashboard/users/add",
            icon: PlusCircle,
            items: [],
          },
        ],
      };
    }
    return null;
  };

  // Combine navigation items based on role
  const getNavigationItems = () => {
    const navItems = [...baseNavItems];

    const usersNav = getUsersNav();
    if (usersNav) {
      navItems.push(usersNav);
    }

    return navItems;
  };

  // Format user data for NavUser component
  const userData = user
    ? {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        avatar: user.avatar_url || "/avatars/default.jpg",
      }
    : null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavigationItems()} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};

export { AppSidebar };
