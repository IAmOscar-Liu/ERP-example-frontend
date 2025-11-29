import { useAuth } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";
import { DotIcon } from "lucide-react";
import { usePageData } from "../context/PageData";

function CustomTitle({ className = "" }: { className?: string }) {
  const { pageTitle } = usePageData();
  const { currentUser } = useAuth();

  return (
    <div className={cn("flex flex-wrap items-center", className)}>
      <h1 className="me-2 text-2xl tracking-wide">
        {/* <img src={FuJenIcon} alt="" className="me-2 inline-block size-10" /> */}
        {currentUser?.fullName}
      </h1>
      {pageTitle ? (
        <div className="text-muted-foreground flex items-center gap-2">
          <DotIcon className="size-6" />
          <h2 className="text-muted-foreground text-lg">{pageTitle}</h2>
        </div>
      ) : null}
    </div>
  );
}

export default CustomTitle;
