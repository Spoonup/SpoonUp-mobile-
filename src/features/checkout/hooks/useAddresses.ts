import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/addressService';
import type { AddressInput } from '../types';

export const useAddresses = () =>
  useQuery({ queryKey: ['addresses'], queryFn: addressService.list });

export const useSaveAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, id }: { input: AddressInput; id?: string }) =>
      addressService.save(input, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addressService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};
