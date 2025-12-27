import { useQuery } from "@tanstack/react-query";
import { messageService } from "../services/messageService";

export function useMyMessages() {
  return useQuery({
    queryKey: ["messages", "my-messages"],
    queryFn: async () => {
      const result = await messageService.getMyMessages();
      if (result.success && result.data?.data?.messages) {
        return result.data.data.messages;
      }
      return [];
    },
  });
}









