import { Header } from "@/components/dashboard/navbar/Header";
import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AIChatButton from "./dashboard/theme/AIChatButton";

export default function Layout({children}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        {children}
        <AIChatButton />
      </SidebarInset>
    </SidebarProvider>
  );
}
