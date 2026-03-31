import {
  BellIcon,
  HomeIcon,
  MessagesSquareIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { UserButton } from "@/features/auth/components/user-button";

import { SidebarButton } from "./sidebar-button";
import { WorkspaceSwitcher } from "./workspace-switcher";

export const Sidebar = () => {
  return (
    <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
      <WorkspaceSwitcher />
      <SidebarButton icon={HomeIcon} isActive label="Home" />
      <SidebarButton icon={MessagesSquareIcon} label="DMs" />
      <SidebarButton icon={BellIcon} label="Activity" />
      <SidebarButton icon={MoreHorizontalIcon} label="More" />
      <div className="flex flex-col gap-y-1 justify-center items-center mt-auto">
        <UserButton />
      </div>
    </aside>
  );
};
