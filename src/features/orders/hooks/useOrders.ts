import { useQuery } from '@tanstack/react-query';
import { ordersService } from '../services/ordersService';

export const useOrders = (enabled = true) =>
  useQuery({ queryKey: ['orders'], queryFn: ordersService.list, enabled });

export const useOrder = (id: string) =>
  useQuery({ queryKey: ['orders', id], queryFn: () => ordersService.get(id) });
