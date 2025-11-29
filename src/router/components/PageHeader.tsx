import STLogo from "@/assets/symptom_squirrel.svg";
import { Button } from "@/components/ui/button";
import { Menu, UserCircle2Icon } from "lucide-react";
import { Link } from "react-router";
import { useSidebarContext } from "../context/SidebarData";
import CustomTitle from "./CustomTitle";
import HeaderMenuSettings from "./HeaderMenuSettings";
import DefaultTitle from "./DefaultTitle";
import { useAuth } from "@/context/AuthProvider";

function PageHeader() {
  const { currentUser } = useAuth();

  return (
    <header className="z-10 flex h-[72px] gap-4 shadow-md dark:shadow-neutral-700">
      <div className="w-56">
        <PageHeaderLogoSection />
      </div>
      <DefaultTitle className="flex-grow" />
      {/* <CustomTitle className="h-full flex-grow" /> */}
      <div className="me-4 flex items-center gap-2">
        <UserCircle2Icon size={28} className="text-foreground" />

        <div className="min-w-[10ch]">
          <p className="text-foreground mb-[-2px]">
            {currentUser?.fullName || "N/A"}
          </p>
          <p className="text-muted-foreground max-w-[30ch] truncate text-sm">
            {currentUser?.email || "N/A"}
          </p>
        </div>

        <HeaderMenuSettings />
      </div>
    </header>
  );
}

export function PageHeaderLogoSection() {
  const { toggle } = useSidebarContext();

  return (
    <div className="flex h-full flex-shrink-0 items-center gap-2 px-1.5 py-2">
      <Button onClick={toggle} variant="ghost" size="icon">
        <Menu />
      </Button>
      <Link to="/" className="flex h-full flex-grow items-center gap-2">
        <img
          src={STLogo}
          className="size-12 object-contain object-left"
          alt=""
        />
        <div className="text-foreground text-2xl font-semibold">Brand</div>
      </Link>
      {/* <Link
        to="/start"
        className="flex items-center gap-2 text-2xl font-semibold text-foreground"
      >
        <img src={cmsBrand} alt="" />
        ST
      </Link> */}
    </div>
  );
}

export default PageHeader;
