import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";
import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";

/**
 * Hook for managing the state of the right-side panel.
 *
 * This hook provides functions to open and close the panel for viewing messages
 * (in reply threads) and member profiles. It uses Zustand stores to manage
 * the panel's open state and the IDs of the content to display.
 *
 * @returns {
 *   parentMessageId: string | null;
 *   openMessage: (messageId: string) => void;
 *   onClose: () => void;
 *   profileMemberId: string | null;
 *   openProfile: (memberId: string) => void;
 * }
 *
 * @example
 * const { openMessage, openProfile, onClose } = usePanel();
 *
 * // Open panel to view message replies
 * openMessage("message_id_here");
 *
 * // Open panel to view member profile
 * openProfile("member_id_here");
 *
 * // Close panel
 * onClose();
 */
export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useParentMessageId();
  const [profileMemberId, setProfileMemberId] = useProfileMemberId();

  const openMessage = (messageId: string) => {
    setParentMessageId(messageId);
    setProfileMemberId(null);
  };

  const openProfile = (memberId: string) => {
    setProfileMemberId(memberId);
    setParentMessageId(null);
  };

  const onClose = () => {
    setParentMessageId(null);
    setProfileMemberId(null);
  };

  return {
    parentMessageId,
    openMessage,
    onClose,
    profileMemberId,
    openProfile,
  };
};
