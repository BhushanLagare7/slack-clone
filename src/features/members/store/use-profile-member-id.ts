import { parseAsString, useQueryState } from "nuqs";

export const useProfileMemberId = () => {
  return useQueryState(
    "profileMemberId",
    parseAsString.withOptions({ clearOnDefault: true }),
  );
};
