import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      try {
        const result = await notificationService.getUnreadCount();
        if (result.success && result.data?.data?.unreadCount !== undefined) {
          return result.data.data.unreadCount;
        }
        return 0;
      } catch (error) {
        return 0;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}









