import { useCallback, useState } from 'react';

// Pull-to-refresh state for any list: spread onto FlatList/SectionList/
// ScrollView-RefreshControl as `refreshing` + `onRefresh`.
export const useRefresh = (refetch: () => Promise<unknown>) => {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  return { refreshing, onRefresh };
};
