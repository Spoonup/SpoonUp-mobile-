import { useQuery } from '@tanstack/react-query';
import { planService } from '../services/planService';

export const PLAN_KEY = ['plan'];

export const usePlan = () =>
  useQuery({ queryKey: PLAN_KEY, queryFn: planService.getPlan });
