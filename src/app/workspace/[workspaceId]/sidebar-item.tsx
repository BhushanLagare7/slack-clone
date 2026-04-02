import type { IconType } from "react-icons/lib";
import Link from "next/link";

import { cva, VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";

import { Id } from "../../../../convex/_generated/dataModel";

const sidebarItemsVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#F9EDFFCC]",
        active: "text-[#481349] bg-white/90 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface SidebarItemProps {
  label: string;
  id: Id<"channels"> | string;
  icon: LucideIcon | IconType;
  variant?: VariantProps<typeof sidebarItemsVariants>["variant"];
}

export const SidebarItem = ({
  label,
  id,
  icon: Icon,
  variant,
}: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();
  return (
    <Button
      asChild
      className={cn(sidebarItemsVariants({ variant }))}
      size="sm"
      variant="transparent"
    >
      <Link href={`/workspace/${workspaceId}/channel/${id}`}>
        <Icon className="size-3.5 mr-1 shrink-0" />
        <span className="text-sm truncate">{label}</span>
      </Link>
    </Button>
  );
};
