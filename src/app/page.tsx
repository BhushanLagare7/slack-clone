"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { LoaderIcon } from "lucide-react";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";

export default function Home() {
  const router = useRouter();
  const [openCreateWorkspaceModal, setOpenCreateWorkspaceModal] =
    useCreateWorkspaceModal();
  const { data, isLoading } = useGetWorkspaces();

  const workspaceId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) return;

    if (workspaceId) {
      router.replace(`/workspace/${workspaceId}`);
    } else if (!openCreateWorkspaceModal) {
      setOpenCreateWorkspaceModal(true);
    }
  }, [
    isLoading,
    workspaceId,
    openCreateWorkspaceModal,
    setOpenCreateWorkspaceModal,
    router,
  ]);

  const isRedirecting = !!workspaceId;
  const isResolvingWorkspace = isLoading || isRedirecting;

  if (!isResolvingWorkspace) {
    return null;
  }

  return (
    <div className="h-full flex items-center justify-center" role="status">
      <span className="sr-only">Loading...</span>
      <LoaderIcon aria-hidden="true" className="animate-spin size-6 text-muted-foreground" />
    </div>
  );
}
