import { useEffect, useRef, useState } from 'react';
import { getSicks } from '../../services/apiInstance';
import './Home.css';
import { useCallback } from 'react';
import { SearchResult } from '../../types/Search';
import { useScrollToSelectedElement } from '../../hooks/useScrollToSelectedElement';

export function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recommendedResults, setRecommenedResults] = useState<SearchResult[]>([]);
  const [lastSearchedQuery, setLastSearchedQuery] = useState<string>(''); // New state variable
  const cache = useRef<{ [query: string]: SearchResult[] }>({});
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);
  const resultsContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSubmitSearch = useCallback(() => {
    setLastSearchedQuery(searchQuery);
  }, [searchQuery]);

  const handleSelectedSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setLastSearchedQuery(query);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing === true) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedItemIndex(prevIndex => {
          if (prevIndex === recommendedResults.length - 1) {
            return 0;
          } else {
            return prevIndex + 1;
          }
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedItemIndex(prevIndex => {
          if (prevIndex === -1 || prevIndex === 0) {
            return recommendedResults.length - 1;
          } else {
            return prevIndex - 1;
          }
        });
      } else if (e.key === 'Enter') {
        if (selectedItemIndex !== -1 && recommendedResults[selectedItemIndex]) {
          e.preventDefault();
          handleSelectedSearch(recommendedResults[selectedItemIndex].sickNm);
          setSelectedItemIndex(-1);
        }
      }
    },
    [recommendedResults, selectedItemIndex, handleSelectedSearch],
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  useEffect(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }

    if (searchQuery.trim() !== '' && cache.current[searchQuery]) {
      setRecommenedResults(cache.current[searchQuery]);
      setSelectedItemIndex(-1);
    } else {
      delayTimerRef.current = setTimeout(() => {
        if (searchQuery.trim() !== '') {
          getSicks(searchQuery).then(res => {
            setRecommenedResults(res);
            cache.current[searchQuery] = res;
            console.info('calling api');
            setSelectedItemIndex(-1);
          });
        } else {
          setRecommenedResults([]);
          setSelectedItemIndex(-1);
        }
      }, 400);
    }

    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, [searchQuery]);

  // useEffect(() => {
  //   if (resultsContainerRef.current && selectedItemIndex !== -1) {
  //     const selectedElement = resultsContainerRef.current.querySelector('.selected');
  //     if (selectedElement) {
  //       selectedElement.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'center',
  //         inline: 'nearest',
  //       });
  //     }
  //   }
  // }, [selectedItemIndex]);
  const scrollOptions: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  };

  useScrollToSelectedElement(resultsContainerRef, selectedItemIndex, scrollOptions);

  return (
    <div className="wrapper">
      <div className="header">국내 모든 임상시험 검색하고 온라인으로 참여하기</div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmitSearch();
        }}
      >
        <div className="search-container">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button type="submit">검색</button>
        </div>
      </form>
      <div className="results-container" ref={resultsContainerRef}>
        <div className="recommended-title">추천 검색어</div>
        <div className="results-list">
          {recommendedResults.length === 0 ? (
            <div className="no-results">결과가 없습니다</div>
          ) : (
            recommendedResults.map((result, index) => (
              <div
                key={result.sickCd}
                className={`result-item ${selectedItemIndex === index ? 'selected' : ''}`}
                onClick={() => {
                  setSearchQuery(result.sickNm);
                  handleSelectedSearch(result.sickNm);
                }}
              >
                {result.sickNm}
              </div>
            ))
          )}
        </div>
      </div>
      {lastSearchedQuery && lastSearchedQuery === searchQuery && (
        <div className="last-searched-query">마지막 검색어: {lastSearchedQuery}</div>
      )}
    </div>
  );
}
