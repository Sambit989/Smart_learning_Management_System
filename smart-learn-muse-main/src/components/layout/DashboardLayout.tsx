import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";
import AIChatPanel from "@/components/features/AIChatPanel";
import TimeTracker from "@/components/common/TimeTracker";

export default function DashboardLayout({ children, hideNavbar = false }: { children: ReactNode, hideNavbar?: boolean }) {
  return (
    <div className="min-h-screen gradient-bg">
      <TimeTracker />
      <AppSidebar />
      <div className="ml-[256px] transition-all duration-300">
        {!hideNavbar && <Navbar />}
        <main className="p-6">{children}</main>
      </div>
      <AIChatPanel />
    </div>
  );
}
