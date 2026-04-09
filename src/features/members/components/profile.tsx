import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertTriangleIcon,
  ChevronDownIcon,
  LoaderIcon,
  MailIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useCurrentMember } from "@/features/members/api/use-current-members";
import { useGetMember } from "@/features/members/api/use-get-member";
import { useRemoveMember } from "@/features/members/api/use-remove-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { Id } from "../../../../convex/_generated/dataModel";

interface ProfileProps {
  memberId: Id<"members">;
  onClose: () => void;
}

export const Profile = ({ memberId, onClose }: ProfileProps) => {
  const router = useRouter();

  const workspaceId = useWorkspaceId();
  const { data: currentMember, isLoading: isLoadingCurrentMember } =
    useCurrentMember({ workspaceId });
  const { data: member, isLoading: isLoadingMember } = useGetMember({
    id: memberId,
  });

  const [LeaveDialog, leaveConfirm] = useConfirm(
    "Leave workspace",
    "Are you sure you want to leave this workspace?",
  );

  const [RemoveDialog, removeConfirm] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this member?",
  );

  const [UpdateDialog, updateConfirm] = useConfirm(
    "Change role",
    "Are you sure you want to change this member's role?",
  );

  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const onRemove = async () => {
    const ok = await removeConfirm();

    if (!ok) return;

    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("Member removed successfully");
          onClose();
        },
        onError: () => {
          toast.error("Failed to remove member");
        },
      },
    );
  };

  const onLeave = async () => {
    const ok = await leaveConfirm();

    if (!ok) return;

    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("You left the workspace successfully");
          onClose();
          router.push("/");
        },
        onError: () => {
          toast.error("Failed to leave the workspace");
        },
      },
    );
  };

  const onUpdate = async (role: "admin" | "member") => {
    const ok = await updateConfirm();

    if (!ok) return;

    updateMember(
      { id: memberId, role },
      {
        onSuccess: () => {
          toast.success("Role updated successfully");
          onClose();
        },
        onError: () => {
          toast.error("Failed to update role");
        },
      },
    );
  };

  if (isLoadingMember || isLoadingCurrentMember) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 border-b h-[49px]">
          <p className="text-lg font-bold">Profile</p>
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

  if (!member) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 border-b h-[49px]">
          <p className="text-lg font-bold">Profile</p>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 justify-center items-center h-full">
          <AlertTriangleIcon className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Member not found</p>
        </div>
      </div>
    );
  }

  const avatarFallback = member.user.name?.charAt(0) ?? "M";

  return (
    <>
      <LeaveDialog />
      <RemoveDialog />
      <UpdateDialog />
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center px-4 border-b h-[49px]">
          <p className="text-lg font-bold">Profile</p>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex flex-col justify-center items-center p-4">
          <Avatar className="max-w-[256px] max-h-[256px] size-full">
            <AvatarImage src={member.user.image} />
            <AvatarFallback className="text-6xl aspect-square">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-xl font-bold">{member.user.name}</p>
          {currentMember?.role === "admin" &&
          currentMember._id !== member._id ? (
            <div className="flex gap-2 items-center mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="flex-1 capitalize"
                    disabled={isUpdatingMember || isRemovingMember}
                    variant="outline"
                  >
                    {member.role} <ChevronDownIcon className="ml-2 size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={member.role}
                    onValueChange={(role) =>
                      !isUpdatingMember &&
                      !isRemovingMember &&
                      onUpdate(role as "admin" | "member")
                    }
                  >
                    <DropdownMenuRadioItem value="admin">
                      Admin
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="member">
                      Member
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                className="flex-1"
                disabled={isRemovingMember || isUpdatingMember}
                variant="outline"
                onClick={onRemove}
              >
                Remove
              </Button>
            </div>
          ) : currentMember?._id === member._id &&
            currentMember.role !== "admin" ? (
            <div className="mt-4">
              <Button
                className="w-full"
                disabled={isRemovingMember}
                variant="outline"
                onClick={onLeave}
              >
                Leave
              </Button>
            </div>
          ) : null}
        </div>
        <Separator />
        <div className="flex flex-col p-4">
          <p className="mb-4 text-sm font-bold">Contact Information</p>
          <div className="flex gap-2 items-center">
            <div className="flex justify-center items-center rounded-md size-9 bg-muted">
              <MailIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email Address
              </p>
              {member.user.email ? (
                <Link
                  className="text-sm hover:underline text-[#1264A3]"
                  href={`mailto:${member.user.email}`}
                >
                  {member.user.email}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">Not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
