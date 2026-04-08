import { useState } from "react";

import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { LoaderIcon } from "lucide-react";

import { useCurrentMember } from "@/features/members/api/use-current-members";
import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../convex/_generated/dataModel";

import { ChannelHero } from "./channel-hero";
import { Message } from "./message";

const TIME_THRESHOLD = 5; // minutes

const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, "EEEE, MMMM d");
};

interface MessageListProps {
  channelCreationTime?: number;
  canLoadMore: boolean;
  data: GetMessagesReturnType[] | undefined;
  isLoadingMore: boolean;
  loadMore: () => void;
  channelName?: string;
  memberImage?: string;
  memberName?: string;
  variant?: "channel" | "thread" | "conversation";
}

export const MessageList = ({
  canLoadMore,
  channelCreationTime,
  channelName,
  data,
  isLoadingMore,
  loadMore,
  memberName,
  memberImage,
  variant = "channel",
}: MessageListProps) => {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });

  // Group messages by date
  const groupedMessages = data?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].unshift(message);

      return groups;
    },
    {} as Record<string, typeof data>,
  );

  return (
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
                hideThreadButton={variant === "thread"}
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
      {variant === "channel" && channelName && channelCreationTime && (
        <ChannelHero creationTime={channelCreationTime} name={channelName} />
      )}
    </div>
  );
};
