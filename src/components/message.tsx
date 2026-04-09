import dynamic from "next/dynamic";

import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";

import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { useConfirm } from "@/hooks/use-confirm";
import { usePanel } from "@/hooks/use-panel";
import { cn } from "@/lib/utils";

import { Doc, Id } from "../../convex/_generated/dataModel";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Hint } from "./hint";
import { Reactions } from "./reactions";
import { ThreadBar } from "./thread-bar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";

const Renderer = dynamic(() => import("./renderer"), { ssr: false });
const Editor = dynamic(() => import("./editor"), { ssr: false });

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "hh:mm:ss a")}`;
};

interface MessageProps {
  authorImage?: string;
  authorName?: string;
  body: Doc<"messages">["body"];
  createdAt: Doc<"messages">["_creationTime"];
  hideThreadButton?: boolean;
  id: Id<"messages">;
  image: string | null | undefined;
  isAuthor: boolean;
  isCompact?: boolean;
  isEditing: boolean;
  memberId: Id<"members">;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  setIsEditing: (id: Id<"messages"> | null) => void;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
  updatedAt: Doc<"messages">["updatedAt"];
}

export const Message = ({
  authorImage,
  authorName = "Member",
  body,
  createdAt,
  hideThreadButton,
  id,
  image,
  isAuthor,
  isCompact,
  isEditing,
  memberId,
  reactions,
  setIsEditing,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
  updatedAt,
}: MessageProps) => {
  const { parentMessageId, openMessage, openProfile, onClose } = usePanel();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete message",
    "Are you sure you want to delete this message? This cannot be undone.",
  );

  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovingMessage } =
    useRemoveMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } =
    useToggleReaction();

  const isPending =
    isUpdatingMessage || isRemovingMessage || isTogglingReaction;

  const handleReaction = (value: string) => {
    toggleReaction(
      { messageId: id, value },
      {
        onError: () => {
          toast.error("Failed to toggle reaction");
        },
      },
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();

    if (!ok) return;

    removeMessage(
      { id },
      {
        onSuccess: () => {
          toast.success("Message deleted successfully");

          if (parentMessageId === id) {
            onClose();
          }
        },
        onError: () => {
          toast.error("Failed to delete message");
        },
      },
    );
  };

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { id, body },
      {
        onSuccess: () => {
          toast.success("Message updated successfully");
          setIsEditing(null);
        },
        onError: () => {
          toast.error("Failed to update message");
        },
      },
    );
  };

  const avatarFallback = (authorName || "Member").charAt(0).toUpperCase();

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />
        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing && "bg-[#F2C74433] hover:bg-[#F2C74433]",
            isRemovingMessage &&
              "bg-rose-500/50 transform transition-all space-y-0 origin-bottom duration-200",
          )}
        >
          <div className="flex gap-2 items-start">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs opacity-0 text-muted-foreground group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>
            {isEditing ? (
              <div className="size-full">
                <Editor
                  defaultValue={JSON.parse(body)}
                  disabled={isPending}
                  variant="update"
                  onCancel={() => setIsEditing(null)}
                  onSubmit={handleUpdate}
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={body} />
                <Thumbnail url={image} />
                {!!updatedAt && (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                )}
                <Reactions data={reactions} onChange={handleReaction} />
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  name={threadName}
                  timestamp={threadTimestamp}
                  onClick={() => openMessage(id)}
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <Toolbar
              handleDelete={handleDelete}
              handleEdit={() => setIsEditing(id)}
              handleReaction={handleReaction}
              handleThread={() => openMessage(id)}
              hideThreadButton={hideThreadButton}
              isAuthor={isAuthor}
              isPending={isPending}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#F2C74433] hover:bg-[#F2C74433]",
          isRemovingMessage &&
            "bg-rose-500/50 transform transition-all space-y-0 origin-bottom duration-200",
        )}
      >
        <div className="flex gap-2 items-start">
          <button onClick={() => openProfile(memberId)}>
            <Avatar size="lg">
              <AvatarImage src={authorImage} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </button>
          {isEditing ? (
            <div className="size-full">
              <Editor
                defaultValue={JSON.parse(body)}
                disabled={isPending}
                variant="update"
                onCancel={() => setIsEditing(null)}
                onSubmit={handleUpdate}
              />
            </div>
          ) : (
            <div className="flex overflow-hidden flex-col w-full">
              <div className="text-sm">
                <button
                  className="font-bold text-primary hover:underline"
                  onClick={() => openProfile(memberId)}
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {format(new Date(createdAt), "h:mm a")}
                  </button>
                </Hint>
              </div>
              <Renderer value={body} />
              <Thumbnail url={image} />
              {!!updatedAt && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => openMessage(id)}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            handleDelete={handleDelete}
            handleEdit={() => setIsEditing(id)}
            handleReaction={handleReaction}
            handleThread={() => openMessage(id)}
            hideThreadButton={hideThreadButton}
            isAuthor={isAuthor}
            isPending={isPending}
          />
        )}
      </div>
    </>
  );
};
