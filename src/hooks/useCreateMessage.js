import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService } from "../services/messageService";

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const result = await messageService.createMessage(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to send message");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}









