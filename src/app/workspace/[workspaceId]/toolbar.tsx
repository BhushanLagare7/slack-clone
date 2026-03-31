import { InfoIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

export const Toolbar = () => {
  const workspaceId = useWorkspaceId();
  const { data: workspace } = useGetWorkspace({ id: workspaceId });

  return (
    <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1" />
      <div className="min-w-[280px] max-w-[642px] grow-2 shrink">
        <Button
          className="justify-start px-2 w-full h-7 bg-accent/25 hover:bg-accent/25"
          size="sm"
        >
          <SearchIcon className="mr-2 text-white size-4" />
          <span className="text-xs text-white">Search {workspace?.name}</span>
        </Button>
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
