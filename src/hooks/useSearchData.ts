import { useEffect, useRef } from 'react';
import { SearchResult } from '../types/Search';
import { getSicks } from '../services/apiInstance';

function useSearchData(
  searchQuery: string,
  setRecommendedResults: React.Dispatch<React.SetStateAction<SearchResult[]>>,
  setSelectedItemIndex: React.Dispatch<React.SetStateAction<number>>,
) {
  const cache = useRef<{ [query: string]: { data: SearchResult[]; timestamp: number } }>({});
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceDelay = searchQuery.length > 2 ? 400 : 600;
  const cacheExpirationTime = 20000; // 20 seconds

  useEffect(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }

    if (searchQuery.trim() !== '' && cache.current[searchQuery]) {
      const cacheEntry = cache.current[searchQuery];
      const currentTime = Date.now();

      if (currentTime - cacheEntry.timestamp <= cacheExpirationTime) {
        // Cache is still valid, use cached data
        setRecommendedResults(cacheEntry.data);
        setSelectedItemIndex(-1);
        return;
      }
    }

    delayTimerRef.current = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        getSicks(searchQuery).then(res => {
          setRecommendedResults(res);
          cache.current[searchQuery] = { data: res, timestamp: Date.now() }; // Update cache with data and timestamp
          console.info('calling api');
          setSelectedItemIndex(-1);
        });
      } else {
        setRecommendedResults([]);
        setSelectedItemIndex(-1);
      }
    }, debounceDelay);

    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, [searchQuery, setRecommendedResults, setSelectedItemIndex, debounceDelay]);
}

export default useSearchData;
