import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeSwitcher } from "./theme-switcher"
import { UserMenu } from "./user-menu"

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = {
    name: "John Doe",
    avatar: "/avatars/user.jpg"
  }

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/')
      .filter(path => path !== '');
   
    let breadcrumbs = [];
    
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard'
    });
   
    if (paths.includes('users')) {
      breadcrumbs.push({
        label: 'Users',
        href: '/dashboard/users'
      });
   
      const lastPath = paths[paths.length - 1];
      if (lastPath === 'add') {
        breadcrumbs.push({
          label: 'Add User',
          href: undefined
        });
      } else if (lastPath !== 'users') {
        breadcrumbs.push({
          label: 'Update User',
          href: undefined
        });
      }
    } 
    else if (paths.includes('roles')) {
      breadcrumbs.push({
        label: 'Roles',
        href: '/dashboard/roles'
      });
   
      if (paths.includes('permissions')) {
        breadcrumbs.push({
          label: 'Manage Permissions',
          href: undefined
        });
      }
    }
    else if (paths.includes('types&labels')) {
      breadcrumbs.push({
        label: 'Types & Labels', 
        href: '/dashboard/types&labels'
      });
    }
    else if (paths.includes('business')) {
      breadcrumbs.push({
        label: 'Business',
        href: '/dashboard/business'
      });
    }
    else if (paths.includes('income')) {
      breadcrumbs.push({
        label: 'Income',
        href: '/dashboard/income' 
      });
    }
    else if (paths.includes('vehicle')) {
      breadcrumbs.push({
        label: 'Vehicles',
        href: '/dashboard/vehicle'
      });
    }
    else if (paths.includes('ProfilePage')) {
      breadcrumbs.push({
        label: 'Profile',
        href: '/dashboard/ProfilePage'
      });
    }
   
    return breadcrumbs;
   };

  const breadcrumbItems = generateBreadcrumbs();

  if (location.pathname === '/login' || location.pathname === '/forgot-password') {
    return null;
  }

  const handleClick = (e, href) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
                <BreadcrumbItem className="hidden md:block">
                  {item.href ? (
                    <BreadcrumbLink 
                      href={item.href}
                      onClick={(e) => handleClick(e, item.href)}
                    >
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-4 px-4">
        <ThemeSwitcher />
        <UserMenu user={user} />
      </div>
    </header>
  );
}