import { useState } from "react";
import Link from "next/link";

import { InfoIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

export const Toolbar = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ id: workspaceId });
  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });

  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1" />
      <div className="min-w-[280px] max-w-[642px] grow-2 shrink">
        <Button
          className="justify-start px-2 w-full h-7 bg-accent/25 hover:bg-accent/25"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <SearchIcon className="mr-2 text-white size-4" />
          <span className="text-xs text-white">Search {workspace?.name}</span>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Channels">
                {channels?.map((channel) => (
                  <CommandItem
                    key={channel._id}
                    onSelect={() => setOpen(false)}
                  >
                    <Link
                      href={`/workspace/${workspaceId}/channel/${channel._id}`}
                    >
                      {channel.name}
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Members">
                {members?.map((member) => (
                  <CommandItem
                    key={member._id}
                    onSelect={() => setOpen(false)}
                  >
                    <Link
                      href={`/workspace/${workspaceId}/member/${member._id}`}
                    >
                      {member.user.name}
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>
      <div className="flex flex-1 justify-end items-center ml-auto">
        <Button
          aria-label="Workspace info"
          size="icon-sm"
          variant="transparent"
        >
          <InfoIcon className="text-white size-5" />
        </Button>
      </div>
    </nav>
  );
};
