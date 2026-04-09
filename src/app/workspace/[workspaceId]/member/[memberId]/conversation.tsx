import { LoaderIcon } from "lucide-react";

import { MessageList } from "@/components/message-list";
import { useGetMember } from "@/features/members/api/use-get-member";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useMemberId } from "@/hooks/use-member-id";
import { usePanel } from "@/hooks/use-panel";

import { Id } from "../../../../../../convex/_generated/dataModel";

import { ChatInput } from "./chat-input";
import { Header } from "./header";

interface ConversationProps {
  id: Id<"conversations">;
}

export const Conversation = ({ id }: ConversationProps) => {
  const memberId = useMemberId();

  const { openProfile } = usePanel();

  const { data: member, isLoading: isMemberLoading } = useGetMember({
    id: memberId,
  });
  const { results, status, loadMore } = useGetMessages({ conversationId: id });

  if (isMemberLoading || status === "LoadingFirstPage") {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        memberImage={member?.user.image}
        memberName={member?.user.name}
        onClick={() => openProfile(memberId)}
      />
      <MessageList
        canLoadMore={status === "CanLoadMore"}
        data={results}
        isLoadingMore={status === "LoadingMore"}
        loadMore={loadMore}
        memberImage={member?.user.image}
        memberName={member?.user.name}
        variant="conversation"
      />
      <ChatInput
        conversationId={id}
        placeholder={`Message ${member?.user.name}`}
      />
    </div>
  );
};
