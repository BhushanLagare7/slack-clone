"use client";

import { LoaderIcon, LogOutIcon } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCurrentUser } from "../api/use-current-user";

export const UserButton = () => {
  const { signOut } = useAuthActions();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <LoaderIcon className="animate-spin size-4 text-muted-foreground" />;
  }

  if (!user) {
    return null;
  }

  const { name, image } = user;
  const avatarFallback = name?.charAt(0).toUpperCase() ?? "U";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="relative outline-none">
        <Avatar className="transition size-10 hover:opacity-75">
          <AvatarImage alt={name} src={image} />
          <AvatarFallback className="text-white bg-sky-500">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-60" side="right">
        <DropdownMenuItem className="h-10" onClick={() => signOut()}>
          <LogOutIcon className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
