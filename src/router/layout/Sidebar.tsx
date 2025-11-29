import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import {
  Children,
  Fragment,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useIntl } from "react-intl";
import { Link, useLocation, useNavigate } from "react-router";
import { PageHeaderLogoSection } from "../components/PageHeader";
import { RequireAuth } from "../components/RequireAuth";
import { useSidebarContext } from "../context/SidebarData";
import { PERMISSION, PERMISSION_GROUP } from "@/constants";

type SmallSidebarItemProps = {
  isActive?: boolean;
  Icon: ElementType;
  title: string;
  url?: string;
  children?: ReactNode;
  acceptAuths?: string[];
};

type SmallSidebarSubItemProps = {
  Icon: ElementType;
  title: string;
  url: string;
  acceptAuths?: string[];
};

type LargeSidebarSectionProps = {
  children: ReactNode;
  title?: string;
  visibleItemCount?: number;
  acceptAuths?: string[];
};

type LargeSidebarItemProps = {
  IconOrImgUrl: ElementType | string;
  title: string;
  url: string;
  acceptAuths?: string[];
};

function Sidebar() {
  const { isLargeOpen, isSmallOpen, close } = useSidebarContext();
  const { formatMessage: t } = useIntl();

  return (
    <>
      <aside
        className={cn(
          "scrollbar-hidden bg-sidebar text-foreground sticky top-0 flex w-24 flex-col overflow-y-auto px-1 pt-2 pb-2",
          {
            "lg:hidden": isLargeOpen,
            "lg:flex": !isLargeOpen,
          },
        )}
      >
        <SmallSidebarItem
          Icon={LucideIcons.Home}
          title={t({ id: "MENU.HOME" })}
          url="/"
        />
        <SmallSidebarItem
          Icon={LucideIcons.LayoutDashboardIcon}
          title={t({ id: "MENU.DASHBOARD" })}
          url="/dashboard"
        />
        <SmallSidebarItem
          Icon={LucideIcons.UserIcon}
          title={t({ id: "MENU.PERSONAL_MNG" })}
          url="/personal"
        >
          <SmallSidebarSubItem
            Icon={LucideIcons.BriefcaseIcon}
            title={t({ id: "MENU.PERSONAL_MNG.ATTENDANCE" })}
            url="/personal/attendance"
          />
          <SmallSidebarSubItem
            Icon={LucideIcons.CalendarCheckIcon}
            title={t({ id: "MENU.PERSONAL_MNG.LEAVE" })}
            url="/personal/leave"
          />
          <SmallSidebarSubItem
            Icon={LucideIcons.HourglassIcon}
            title={t({ id: "MENU.PERSONAL_MNG.OVERTIME" })}
            url="/personal/overtime"
          />
        </SmallSidebarItem>
        <SmallSidebarItem
          Icon={LucideIcons.ShieldUserIcon}
          title={t({ id: "MENU.MANAGER_MNG" })}
          url="/manager"
          acceptAuths={PERMISSION_GROUP.Management}
        >
          <SmallSidebarSubItem
            Icon={LucideIcons.BriefcaseIcon}
            title={t({ id: "MENU.MANAGER_MNG.ATTENDANCE" })}
            url="/manager/attendance"
            acceptAuths={[PERMISSION.AttendanceView]}
          />
          <SmallSidebarSubItem
            Icon={LucideIcons.CalendarCheckIcon}
            title={t({ id: "MENU.MANAGER_MNG.LEAVE" })}
            url="/manager/leave"
            acceptAuths={[PERMISSION.LeaveReview]}
          />
          <SmallSidebarSubItem
            Icon={LucideIcons.HourglassIcon}
            title={t({ id: "MENU.MANAGER_MNG.OVERTIME" })}
            url="/manager/overtime"
            acceptAuths={[PERMISSION.OvertimeReview]}
          />
        </SmallSidebarItem>
        {/* <SmallSidebarItem
            Icon={LucideIcons.UserRoundIcon}
            title={t({ id: "MENU.SALESMAN" })}
            url="/salesman"
            
          /> */}
        {/* <SmallSidebarItem
            Icon={LucideIcons.SchoolIcon}
            title={t({ id: "MENU.RESEARCH_MNG" })}
            url="/research"
            
          >
            <SmallSidebarSubItem
              Icon={LucideIcons.GraduationCapIcon}
              title={t({ id: "MENU.RESEARCH_MNG.STUDY" })}
              url="/research/study"
              
            />
            <SmallSidebarSubItem
              Icon={LucideIcons.BookTextIcon}
              title={t({ id: "MENU.RESEARCH_MNG.SURVEY" })}
              url="/research/survey"
              
            />
            <SmallSidebarSubItem
              Icon={LucideIcons.CalendarSyncIcon}
              title={t({ id: "MENU.RESEARCH_MNG.SCHEDULE" })}
              url="/research/schedule"
              
            />
          </SmallSidebarItem>
          <SmallSidebarItem
            Icon={LucideIcons.UserCheckIcon}
            title={t({ id: "MENU.ACCOUNT_MNG" })}
            url="/account"
            
          >
            <SmallSidebarSubItem
              Icon={LucideIcons.TagsIcon}
              title={t({ id: "MENU.ACCOUNT_MNG.ROLE" })}
              url="/account/role"
              
            />
            <SmallSidebarSubItem
              Icon={LucideIcons.UserCog2Icon}
              title={t({ id: "MENU.ACCOUNT_MNG.USER" })}
              url="/account/user"
              
            />
          </SmallSidebarItem> */}
      </aside>
      {isSmallOpen && (
        <div
          onClick={close}
          className="bg-secondary fixed inset-0 z-999 opacity-50 lg:hidden"
        />
      )}
      <aside
        className={cn(
          "scrollbar-hidden bg-sidebar absolute top-0 w-56 flex-col gap-1 overflow-y-auto px-2 pt-2 pb-4 lg:sticky",
          {
            "lg:flex": isLargeOpen,
            "lg:hidden": !isLargeOpen,
            "z-999 flex min-h-screen": isSmallOpen,
            hidden: !isSmallOpen,
          },
        )}
      >
        <div className="sticky top-0 h-[72px] px-2 lg:hidden">
          <PageHeaderLogoSection />
        </div>

        <LargeSidebarSection>
          <LargeSidebarItem
            IconOrImgUrl={LucideIcons.Home}
            title={t({ id: "MENU.HOME" })}
            url="/"
          />
          <LargeSidebarItem
            IconOrImgUrl={LucideIcons.LayoutDashboardIcon}
            title={t({ id: "MENU.DASHBOARD" })}
            url="/dashboard"
          />
        </LargeSidebarSection>

        <LargeSidebarSection title={t({ id: "MENU.PERSONAL_MNG" })}>
          <LargeSidebarItem
            IconOrImgUrl={LucideIcons.BriefcaseIcon}
            title={t({ id: "MENU.PERSONAL_MNG.ATTENDANCE" })}
            url="/personal/attendance"
          />
          <LargeSidebarItem
            IconOrImgUrl={LucideIcons.CalendarCheckIcon}
            title={t({ id: "MENU.PERSONAL_MNG.LEAVE" })}
            url="/personal/leave"
          />
          <LargeSidebarItem
            IconOrImgUrl={LucideIcons.HourglassIcon}
            title={t({ id: "MENU.PERSONAL_MNG.OVERTIME" })}
            url="/personal/overtime"
          />
        </LargeSidebarSection>

        <LargeSidebarSection
          title={t({ id: "MENU.MANAGER_MNG" })}
          acceptAuths={PERMISSION_GROUP.Management}
        >
          <LargeSidebarItem
            IconOrImgUrl={LucideIcons.BriefcaseIcon}
            title={t({ id: "MENU.MANAGER_MNG.ATTENDANCE" })}
            url="/manager/attendance"
            acceptAuths={[PERMISSION.AttendanceView]}
          />
          <LargeSidebarItem
            IconOrImgUrl={LucideIcons.CalendarCheckIcon}
            title={t({ id: "MENU.MANAGER_MNG.LEAVE" })}
            url="/manager/leave"
            acceptAuths={[PERMISSION.LeaveReview]}
          />
          <LargeSidebarItem
            IconOrImgUrl={LucideIcons.HourglassIcon}
            title={t({ id: "MENU.MANAGER_MNG.OVERTIME" })}
            url="/manager/overtime"
            acceptAuths={[PERMISSION.OvertimeReview]}
          />
        </LargeSidebarSection>
        {/* <LargeSidebarSection
            title={t({ id: "MENU.RESEARCH_MNG" })}
            
          >
            <LargeSidebarItem
              IconOrImgUrl={LucideIcons.GraduationCap}
              title={t({ id: "MENU.RESEARCH_MNG.STUDY" })}
              url="/research/study"
              
            />
            <LargeSidebarItem
              IconOrImgUrl={LucideIcons.BookTextIcon}
              title={t({ id: "MENU.RESEARCH_MNG.SURVEY" })}
              url="/research/survey"
              
            />
            <LargeSidebarItem
              IconOrImgUrl={LucideIcons.CalendarSyncIcon}
              title={t({ id: "MENU.RESEARCH_MNG.SCHEDULE" })}
              url="/research/schedule"
              
            />
          </LargeSidebarSection>
         
          <LargeSidebarSection
            title={t({ id: "MENU.ACCOUNT_MNG" })}
            
          >
            <LargeSidebarItem
              IconOrImgUrl={LucideIcons.TagsIcon}
              title={t({ id: "MENU.ACCOUNT_MNG.ROLE" })}
              url="/account/role"
              
            />
            <LargeSidebarItem
              IconOrImgUrl={LucideIcons.ContactIcon}
              title={t({ id: "MENU.ACCOUNT_MNG.USER" })}
              url="/account/user"
              
            />
          </LargeSidebarSection>
          */}
      </aside>
    </>
  );
}

function SmallSidebarItem({
  Icon,
  title,
  url,
  children,
  acceptAuths,
}: SmallSidebarItemProps) {
  const { pathname } = useLocation();
  // const isActive = !!url && pathname.startsWith(url); // url?.startsWith(pathname);
  const isActive = pathname === url; // url?.startsWith(pathname);

  if (!children)
    return (
      <RequireAuth acceptAuths={acceptAuths}>
        <Link
          to={url ?? ""}
          className={cn(
            "hover:bg-primary/10 my-0.5 flex flex-col items-center gap-1 rounded-lg px-1 py-2 whitespace-nowrap transition-colors",
            {
              "bg-primary/10 text-sidebar-active-text pointer-events-none font-semibold":
                isActive,
            },
          )}
        >
          <Icon className="size-6" />
          <div className="text-sm">{title}</div>
        </Link>
      </RequireAuth>
    );

  const childrenArray = Children.toArray(children).flat();

  return (
    <RequireAuth acceptAuths={acceptAuths}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="my-0.5 h-16 p-0 ring-transparent!">
            <div
              className={cn(
                "hover:bg-primary/10 flex size-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 whitespace-nowrap transition-colors",
                {
                  "bg-primary/10 text-sidebar-active-text pointer-events-none font-semibold":
                    isActive,
                },
              )}
            >
              <Icon className="size-6!" />
              <div className="flex w-full items-center gap-0.5 text-sm">
                <span className="truncate">{title}</span>
                <LucideIcons.ChevronDown className="size-3 shrink-0" />
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right">
          {childrenArray.map((ch, idx) => (
            <Fragment key={idx}>{ch}</Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </RequireAuth>
  );
}

function SmallSidebarSubItem({
  Icon,
  title,
  url,
  acceptAuths,
}: SmallSidebarSubItemProps) {
  const { pathname } = useLocation();
  // const isActive = pathname.startsWith(url); // url?.startsWith(pathname);
  const isActive = pathname === url; // url?.startsWith(pathname);
  const navigate = useNavigate();

  return (
    <RequireAuth acceptAuths={acceptAuths}>
      <DropdownMenuItem
        className={cn(
          "text-foreground hover:bg-primary/10 flex items-center gap-2",
          {
            "bg-primary/10 text-sidebar-active-text pointer-events-none":
              isActive,
          },
        )}
        onClick={() => navigate(url)}
      >
        <Icon className="size-4" />
        <div>{title}</div>
      </DropdownMenuItem>
    </RequireAuth>
  );
}

function LargeSidebarSection({
  children,
  title,
  visibleItemCount = 3,
  acceptAuths,
}: LargeSidebarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childrenArray = Children.toArray(children).flat();
  const showExpandButton = childrenArray.length > visibleItemCount;
  const visibleChildren = isExpanded
    ? childrenArray
    : childrenArray.slice(0, visibleItemCount);
  const ButtonIcon = isExpanded
    ? LucideIcons.ChevronUp
    : LucideIcons.ChevronDown;

  return (
    <RequireAuth acceptAuths={acceptAuths}>
      <div>
        {title && (
          <>
            <hr />
            <div className="text-muted-foreground my-1 ml-4">{title}</div>
          </>
        )}
        {visibleChildren}
        {showExpandButton && (
          <Button
            className="text-foreground"
            onClick={() => setIsExpanded((e) => !e)}
            variant="ghost"
          >
            <ButtonIcon className="size-6" />
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>
    </RequireAuth>
  );
}

function LargeSidebarItem({
  IconOrImgUrl,
  title,
  url,
  acceptAuths,
}: LargeSidebarItemProps) {
  const { pathname } = useLocation();
  // const isActive = pathname.startsWith(url); // url?.startsWith(pathname);
  const isActive = pathname === url; // url?.startsWith(pathname);

  return (
    <RequireAuth acceptAuths={acceptAuths}>
      <Link
        to={url}
        className={cn(
          "hover:bg-primary/10 my-0.5 flex w-full items-center gap-4 rounded-lg px-3 py-2 whitespace-nowrap transition-colors",
          {
            "bg-primary/10 text-sidebar-active-text pointer-events-none font-bold":
              isActive,
          },
        )}
      >
        {typeof IconOrImgUrl === "string" ? (
          <img src={IconOrImgUrl} className="size-6 rounded-full" />
        ) : (
          <IconOrImgUrl className="size-6" />
        )}
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          {title}
        </div>
      </Link>
    </RequireAuth>
  );
}

export default Sidebar;
