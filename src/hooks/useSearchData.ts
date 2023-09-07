import { useEffect, useRef } from 'react';
import { SearchResult } from '../types/Search';
import { getSicks } from '../services/apiInstance';

function useSearchData(
  searchQuery: string,
  setRecommendedResults: React.Dispatch<React.SetStateAction<SearchResult[]>>,
  setSelectedItemIndex: React.Dispatch<React.SetStateAction<number>>,
) {
  const cache = useRef<{ [query: string]: SearchResult[] }>({});
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceDelay = searchQuery.length > 2 ? 400 : 600;

  useEffect(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }

    if (searchQuery.trim() !== '' && cache.current[searchQuery]) {
      setRecommendedResults(cache.current[searchQuery]);
      setSelectedItemIndex(-1);
    } else {
      delayTimerRef.current = setTimeout(() => {
        if (searchQuery.trim() !== '') {
          getSicks(searchQuery).then(res => {
            setRecommendedResults(res);
            cache.current[searchQuery] = res;
            console.info('calling api');
            setSelectedItemIndex(-1);
          });
        } else {
          setRecommendedResults([]);
          setSelectedItemIndex(-1);
        }
      }, debounceDelay);
    }

    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, [searchQuery, setRecommendedResults, setSelectedItemIndex, debounceDelay]);
}

export default useSearchData;
