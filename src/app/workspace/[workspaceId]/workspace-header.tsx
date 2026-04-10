import { useState } from "react";

import { ChevronDownIcon, ListFilterIcon, SquarePenIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Doc } from "../../../../convex/_generated/dataModel";

import { InviteModal } from "./invite-modal";
import { PreferencesModal } from "./preferences-modal";

interface WorkspaceHeaderProps {
  workspace: Doc<"workspaces">;
  isAdmin: boolean;
}

export const WorkspaceHeader = ({
  workspace,
  isAdmin,
}: WorkspaceHeaderProps) => {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <InviteModal
        joinCode={workspace.joinCode}
        name={workspace.name}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
      <PreferencesModal
        initialValue={workspace.name}
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />
      <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="font-semibold text-lg w-auto p-1.5 overflow-hidden"
              size="sm"
              variant="transparent"
            >
              <span className="truncate">{workspace.name}</span>
              <ChevronDownIcon className="ml-1 size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64" side="bottom">
            <DropdownMenuItem className="capitalize cursor-pointer">
              <div className="size-9 relative overflow-hidden bg-[#616061] text-white font-semibold rounded-md flex items-center justify-center text-xl mr-2">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <p className="font-bold">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">
                  Active workspace
                </p>
              </div>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="py-2 cursor-pointer"
                  onClick={() => setInviteOpen(true)}
                >
                  Invite people to {workspace.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="py-2 cursor-pointer"
                  onClick={() => setPreferencesOpen(true)}
                >
                  Preferences
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-0.5">
          <Hint align="center" label="Filter conversations" side="bottom">
            <Button size="icon-sm" variant="transparent">
              <ListFilterIcon className="size-4" />
            </Button>
          </Hint>
          <Hint align="center" label="New message" side="bottom">
            <Button size="icon-sm" variant="transparent">
              <SquarePenIcon className="size-4" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
};
