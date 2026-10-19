import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportService } from '../services/supportService';
import type { NewTicketInput, PickedFile } from '../types';

export const useTickets = (enabled = true) =>
  useQuery({
    queryKey: ['tickets'],
    queryFn: supportService.list,
    enabled,
  });

export const useTicket = (id: string) =>
  useQuery({
    queryKey: ['tickets', id],
    queryFn: () => supportService.get(id),
  });

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewTicketInput) => supportService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
};

export const useReply = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, file }: { body: string; file?: PickedFile }) =>
      supportService.reply(ticketId, body, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
};
