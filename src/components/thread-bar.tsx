import { formatDistanceToNow } from "date-fns";
import { ChevronRightIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ThreadBarProps {
  count?: number;
  image?: string;
  name?: string;
  timestamp?: number;
  onClick?: () => void;
}

export const ThreadBar = ({
  count,
  image,
  name,
  timestamp,
  onClick,
}: ThreadBarProps) => {
  if (!count || !timestamp) return null;

  const avatarFallback = name?.charAt(0).toUpperCase() || "U";

  return (
    <button
      className="flex justify-start items-center p-1 rounded-md border border-transparent hover:bg-white hover:border-border group/thread-bar transition max-w-[600px]"
      onClick={onClick}
    >
      <div className="flex overflow-hidden gap-2 items-center">
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={image} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="text-xs font-bold text-sky-700 truncate hover:underline">
          {count} {count === 1 ? "reply" : "replies"}
        </span>
        <span className="block text-xs truncate text-muted-foreground group-hover/thread-bar:hidden">
          Last reply{" "}
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </span>
        <span className="hidden text-xs truncate text-muted-foreground group-hover/thread-bar:block">
          View thread
        </span>
      </div>
      <ChevronRightIcon className="ml-auto opacity-0 transition shrink-0 size-4 text-muted-foreground group-hover/thread-bar:opacity-100" />
    </button>
  );
};
