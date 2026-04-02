"use client";

import { useEffect, useMemo } from "react";
import VerificationInput from "react-verification-input";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { useJoin } from "@/features/workspaces/api/use-join";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";

import "./join.css";

const JoinWorkspacePage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { data: workspaceInfo, isLoading } = useGetWorkspaceInfo({
    id: workspaceId,
  });
  const { mutate: join, isPending } = useJoin();

  const isMember = useMemo(
    () => workspaceInfo?.isMember,
    [workspaceInfo?.isMember],
  );

  useEffect(() => {
    if (isMember) {
      router.push(`/workspace/${workspaceId}`);
    }
  }, [isMember, workspaceId, router]);

  const handleComplete = (joinCode: string) => {
    join(
      { joinCode, workspaceId },
      {
        onSuccess: (id) => {
          router.replace(`/workspace/${id}`);
          toast.success("Joined workspace successfully");
        },
        onError: () => {
          toast.error("Failed to join workspace");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderIcon className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  }

  if (!workspaceInfo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col gap-y-4 items-center justify-center">
          <h1 className="text-xl font-bold">Workspace not found</h1>
          <p className="text-base text-muted-foreground">
            Please check the join link and try again
          </p>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      <Image alt="Logo" height={100} src="/logo.svg" width={100} />
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-xl font-bold">Join {workspaceInfo?.name}</h1>
          <p className="text-base text-muted-foreground">
            Enter the workspace code to join
          </p>
        </div>
        <VerificationInput
          autoFocus
          classNames={{
            container: cn(
              "verification-container",
              isPending && "verification-container--pending",
            ),
            character: "verification-character",
            characterInactive: "verification-character--inactive",
            characterSelected: "verification-character--selected",
            characterFilled: "verification-character--filled",
          }}
          length={6}
          onComplete={handleComplete}
        />
      </div>
      <div className="flex gap-x-4">
        <Button asChild size="lg" variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinWorkspacePage;
