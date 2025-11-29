import { Outlet } from "react-router";
import PageHeader from "../components/PageHeader";
import { PageDataProvider } from "../context/PageData";
import { SidebarProvider } from "../context/SidebarData";
import Sidebar from "./Sidebar";

function PrivateLayout() {
  return (
    <PageDataProvider>
      <SidebarProvider>
        <div className="flex h-screen flex-col">
          <PageHeader />
          <div className="grid h-0 flex-grow grid-cols-[auto_1fr]">
            <Sidebar />
            <div className="overflow-y-auto bg-neutral-100 dark:bg-neutral-800">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </PageDataProvider>
  );
}

export default PrivateLayout;
