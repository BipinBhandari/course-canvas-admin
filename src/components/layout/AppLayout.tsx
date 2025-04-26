
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#1A1F2C] dark:bg-[#1A1F2C]">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
