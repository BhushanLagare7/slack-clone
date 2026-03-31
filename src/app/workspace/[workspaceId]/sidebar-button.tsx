import { IconType } from "react-icons/lib";

import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarButtonProps {
  icon: LucideIcon | IconType;
  label: string;
  isActive?: boolean;
}

export const SidebarButton = ({
  icon: Icon,
  label,
  isActive,
}: SidebarButtonProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-0.5 cursor-pointer group">
      <Button
        className={cn(
          "p-2 size-9 group-hover:bg-accent/20",
          isActive && "bg-accent/20",
        )}
        variant="transparent"
      >
        <Icon className="text-white transition-all size-5 group-hover:scale-110" />
      </Button>
      <span className="text-[11px] text-white group-hover:text-accent">
        {label}
      </span>
    </div>
  );
};
