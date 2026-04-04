"use client";

import { LoaderIcon, TriangleAlertIcon } from "lucide-react";

import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useChannelId } from "@/hooks/use-channel-id";

import { ChatInput } from "./chat-input";
import { Header } from "./header";

const ChannelIdPage = () => {
  const channelId = useChannelId();

  const { data: channel, isLoading: isChannelLoading } = useGetChannel({
    id: channelId,
  });

  if (isChannelLoading) {
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
      <div className="flex-1" />
      <ChatInput placeholder={`Message #${channel.name}`} />
    </div>
  );
};

export default ChannelIdPage;
