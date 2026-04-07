"use client";

import { LoaderIcon, TriangleAlertIcon } from "lucide-react";

import { MessageList } from "@/components/message-list";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useChannelId } from "@/hooks/use-channel-id";

import { ChatInput } from "./chat-input";
import { Header } from "./header";

const ChannelIdPage = () => {
  const channelId = useChannelId();

  const { data: channel, isLoading: isChannelLoading } = useGetChannel({
    id: channelId,
  });

  const { results, status, loadMore } = useGetMessages({
    channelId,
  });

  if (isChannelLoading || status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col flex-1 gap-y-2 justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Loading channel...
        </span>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex flex-col flex-1 gap-y-2 justify-center items-center h-full">
        <TriangleAlertIcon className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Channel not found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />
      <MessageList
        canLoadMore={status === "CanLoadMore"}
        channelCreationTime={channel._creationTime}
        channelName={channel.name}
        data={results}
        isLoadingMore={status === "LoadingMore"}
        loadMore={loadMore}
      />
      <ChatInput placeholder={`Message #${channel.name}`} />
    </div>
  );
};

export default ChannelIdPage;
