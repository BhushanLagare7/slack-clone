import { useRef, useState } from "react";
import dynamic from "next/dynamic";

import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { AlertTriangleIcon, LoaderIcon, XIcon } from "lucide-react";
import Quill from "quill";
import { toast } from "sonner";

import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";
import { useCurrentMember } from "@/features/members/api/use-current-members";
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGetMessage } from "@/features/messages/api/use-get-message";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

const TIME_THRESHOLD = 5; // minutes

const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, "EEEE, MMMM d");
};

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  body: string;
  image: Id<"_storage"> | undefined;
};

interface ThreadProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

export const Thread = ({ messageId, onClose }: ThreadProps) => {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const editorRef = useRef<Quill | null>(null);

  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const { data: currentMember, isLoading: isLoadingMember } = useCurrentMember({
    workspaceId,
  });
  const { data: message, isLoading: isLoadingMessage } = useGetMessage({
    id: messageId,
  });
  const { results, status, loadMore } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });

  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef.current?.enable(false);

      const values: CreateMessageValues = {
        body,
        workspaceId,
        parentMessageId: messageId,
        channelId,
        image: undefined,
      };

      if (image) {
        const uploadUrl = await generateUploadUrl({ throwError: true });
        if (!uploadUrl) {
          throw new Error("Failed to generate upload URL");
        }

        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await response.json();
        if (!storageId) {
          throw new Error("Invalid upload response: missing storageId");
        }

        values.image = storageId;
      }

      await createMessage(values, { throwError: true });
      setEditorKey((prev) => prev + 1);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  const isLoading =
    isLoadingMessage || isLoadingMember || status === "LoadingFirstPage";
  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  // Group messages by date
  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].unshift(message);

      return groups;
    },
    {} as Record<string, typeof results>,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 border-b h-[49px]">
          <p className="text-lg font-bold">Thread</p>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex justify-center items-center h-full">
          <LoaderIcon className="animate-spin size-5 text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 border-b h-[49px]">
          <p className="text-lg font-bold">Thread</p>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 justify-center items-center h-full">
          <AlertTriangleIcon className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 border-b h-[49px]">
        <p className="text-lg font-bold">Thread</p>
        <Button size="icon-sm" variant="ghost" onClick={onClose}>
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>

      <div className="flex overflow-y-auto flex-col-reverse flex-1 pb-4 messages-scrollbar">
        {Object.entries(groupedMessages ?? {}).map(([dateKey, messages]) => (
          <div key={dateKey}>
            <div className="relative my-2 text-center">
              <hr className="absolute right-0 left-0 top-1/2 border-t border-gray-300" />
              <span className="inline-block relative px-4 py-1 text-xs bg-white rounded-full border border-gray-300 shadow-sm">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {messages?.map((message, index) => {
              const previousMessage = messages[index - 1];
              const isCompact =
                previousMessage &&
                previousMessage.user?._id &&
                differenceInMinutes(
                  new Date(message._creationTime),
                  new Date(previousMessage._creationTime),
                ) < TIME_THRESHOLD;

              return (
                <Message
                  key={message._id}
                  authorImage={message.user?.image}
                  authorName={message.user?.name}
                  body={message.body}
                  createdAt={message._creationTime}
                  hideThreadButton
                  id={message._id}
                  image={message.image}
                  isAuthor={currentMember?._id === message.memberId}
                  isCompact={isCompact}
                  isEditing={editingId === message._id}
                  memberId={message.memberId}
                  reactions={message.reactions}
                  setIsEditing={setEditingId}
                  threadCount={message.threadCount}
                  threadImage={message.threadImage}
                  threadTimestamp={message.threadTimestamp}
                  updatedAt={message.updatedAt}
                />
              );
            })}
          </div>
        ))}
        <div
          ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting && canLoadMore) {
                    loadMore();
                  }
                },
                { threshold: 1.0 },
              );

              observer.observe(el);
              return () => observer.disconnect();
            }
          }}
          className="h-1"
        />
        {isLoadingMore && (
          <div className="relative my-2 text-center">
            <hr className="absolute right-0 left-0 top-1/2 border-t border-gray-300" />
            <span className="inline-block relative px-4 py-1 text-xs bg-white rounded-full border border-gray-300 shadow-sm">
              <LoaderIcon className="size-4 animate-spin" />
            </span>
          </div>
        )}
        <Message
          authorImage={message.user?.image}
          authorName={message.user?.name}
          body={message.body}
          createdAt={message._creationTime}
          hideThreadButton
          id={message._id}
          image={message.image}
          isAuthor={currentMember?._id === message.memberId}
          isEditing={editingId === message._id}
          memberId={message.memberId}
          reactions={message.reactions}
          setIsEditing={setEditingId}
          updatedAt={message.updatedAt}
        />
      </div>
      <div className="px-4">
        <Editor
          key={editorKey}
          disabled={isPending}
          innerRef={editorRef}
          placeholder="Reply..."
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
