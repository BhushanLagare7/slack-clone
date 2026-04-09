"use client";

import { useEffect, useState } from "react";

import { AlertTriangleIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../../../convex/_generated/dataModel";

import { Conversation } from "./conversation";

const MemberIdPage = () => {
  const memberId = useMemberId();
  const workspaceId = useWorkspaceId();

  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  const {
    mutate: createOrGetConversation,
    isPending: isCreateOrGetConversationPending,
  } = useCreateOrGetConversation();

  useEffect(() => {
    if (!memberId || !workspaceId) return;

    createOrGetConversation(
      { memberId, workspaceId },
      {
        onSuccess: (data) => {
          setConversationId(data);
        },
        onError: () => {
          toast.error("Failed to create or get conversation");
        },
      },
    );
  }, [memberId, workspaceId, createOrGetConversation]);

  if (isCreateOrGetConversationPending) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex flex-col gap-y-2 justify-center items-center h-full">
        <AlertTriangleIcon className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    );
  }

  return <Conversation id={conversationId} />;
};

export default MemberIdPage;
