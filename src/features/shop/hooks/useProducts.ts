import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';

export const useProducts = () =>
  useQuery({ queryKey: ['products'], queryFn: catalogService.list });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['products', id],
    queryFn: () => catalogService.get(id),
  });
