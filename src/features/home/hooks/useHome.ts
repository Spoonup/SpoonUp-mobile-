import { useQuery } from '@tanstack/react-query';
import { homeService } from '../services/homeService';

export const useHome = () =>
  useQuery({ queryKey: ['home'], queryFn: homeService.get });
