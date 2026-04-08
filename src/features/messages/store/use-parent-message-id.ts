import { parseAsString, useQueryState } from "nuqs";

export const useParentMessageId = () => {
  return useQueryState(
    "parentMessageId",
    parseAsString.withOptions({ clearOnDefault: true }),
  );
};
