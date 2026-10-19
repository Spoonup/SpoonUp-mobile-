import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unreadCount } from '../logic';
import { notificationService } from '../services/notificationService';

const KEY = ['notifications'];

export const useNotifications = (enabled = true) =>
  useQuery({ queryKey: KEY, queryFn: notificationService.list, enabled });

// Single source for the Home bell badge and the Notifications screen.
export const useUnreadCount = (enabled = true): number =>
  unreadCount(useNotifications(enabled).data);

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};
