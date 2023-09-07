## 원티드 프리온보딩 3주차 과제 - 개인

- 본 repository는 원티드 프리온보딩 프론트엔드 3주차 과제입니다.
- [배포주소](http://preonboarding-week3-hyoshik.s3-website-ap-southeast-2.amazonaws.com/) 입니다
### 기술 스택

<div>
  <img src="https://img.shields.io/badge/react-61DAFB?style=flat&logo=react&logoColor=white">
  <img src="https://img.shields.io/badge/typescript-3178C6?style=flat&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/axios-5A29E4?style=flat&logo=axios&logoColor=white">
  <img src="https://img.shields.io/badge/react router-CA4245?style=flat&logo=react router&logoColor=white">
</div>
<br />

## 📌 프로젝트 실행 방법

1. Clone the repo

```javascript
git clone https://github.com/teetee6/wanted_week3.git
```

2. Install NPM packages and getting start!

```javascript
npm install && npm start
```

3. [Backend Github](https://github.com/walking-sunset/assignment-api)

<br/>

### 🗂️ 폴더 구조

```
📦src
 ┣ 📂hooks
 ┃ ┣ 📜useScrollToSelectedElement.css
 ┃ ┗ 📜useSearchData.ts
 ┣ 📂pages
 ┃ ┗ 📂Home
 ┃   ┣ 📜Home.css
 ┃   ┗ 📜Home.tsx
 ┣ 📂services
 ┃ ┗ 📜apiInstance.ts
 ┣ 📂types
 ┃ ┗ 📜Search.d.ts
 ┣ 📜App.tsx
 ┣ 📜index.tsx
```

## 💡 상세 기능

### 1. API 호출별로 로컬 캐싱 구현 및 API 호출횟수 줄이는 전략

<details>
  <summary>설명</summary>
  <div>
  
```jsx
function useSearchData(
  searchQuery: string,
  setRecommendedResults: React.Dispatch<React.SetStateAction<SearchResult[]>>,
  setSelectedItemIndex: React.Dispatch<React.SetStateAction<number>>,
) {
  const cache = useRef<{ [query: string]: { data: SearchResult[]; timestamp: number } }>({});
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceDelay = searchQuery.length > 2 ? 400 : 600;
  const cacheExpirationTime = 20000;

useEffect(() => {
if (delayTimerRef.current) {
clearTimeout(delayTimerRef.current);
}

    if (searchQuery.trim() !== '' && cache.current[searchQuery]) {
      const cacheEntry = cache.current[searchQuery];
      const currentTime = Date.now();

      if (currentTime - cacheEntry.timestamp <= cacheExpirationTime) {
        setRecommendedResults(cacheEntry.data);
        setSelectedItemIndex(-1);
        return;
      }
    }

    delayTimerRef.current = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        getSicks(searchQuery).then(res => {
          setRecommendedResults(res);
          cache.current[searchQuery] = { data: res, timestamp: Date.now() };
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

````

- debounceDelay은 매 입력마다 api호출을 하지 않기위한 전략입니다. 2글자 이하인 경우 검색 키워드에 대한 고민할 생각이 많다고 생각되어 600ms로, 2글자 초과인 경우 400ms로 api호출 빈도에 대해 adjustable하게 하였습니다.
- 타이핑할때 마다 api 호출하려고 하기 전에, cache된 데이터인지 확인합니다. cache된 데이터라면 유효한 시간(expire time=20초)인지 확인하고, 둘다 아니라면 아래의 작업을 진행합니다.
- 만약 캐싱된 데이터가 아니라면, setTimeout()을 이용하여 타이핑하는 동안 debounceDelay ms만큼 api호출을 취소하고 예약을 반복하는 방식으로, 매 입력마다 api 호출이 되지 않도록 하였습니다.
- 결국 api 호출에 성공하면, cache에 데이터와 함께 현재 시각을 넣습니다.

  </div>
</details>

### 2. 키보드만으로 추천 검색어들로 이동 가능하도록 구현

<details>
  <summary>설명</summary>
  <div>

```js
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
```

onKeyDown 핸들러에 등록된 handleKeyDown() 함수입니다. 키보드 키에 따라 selectedItemIndex state를 업데이트 하였습니다. 초기상태는 -1 값 입니다. selectedItemIndex인 요소는 `<div className='selected'>`처럼 클래스명에 selected 가 붙습니다.
- 영어의 경우 문제가 없지만, 한글의 경우 IME(Input Method Editor)의 문제, 즉 자음과 모음을 합쳐 하나의 글자를 만드는 Composition인지 과정을 확인해야 합니다. 그렇지 않으면 이벤트 헨들러가 2번 호출될 수 있습니다.

```js
import { useEffect } from 'react';

export function useScrollToSelectedElement(
  resultsContainerRef: React.RefObject<HTMLDivElement>,
  selectedItemIndex: number,
  scrollOptions: ScrollIntoViewOptions,
) {
  useEffect(() => {
    if (resultsContainerRef.current && selectedItemIndex !== -1) {
      const selectedElement = resultsContainerRef.current.querySelector('.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView(scrollOptions);
      }
    }
  }, [resultsContainerRef, selectedItemIndex, scrollOptions]);
}
```

Element 인터페이스의 scrollIntoView() 메소드를 이용하여 `<div className='selected'>`인 요소에 스크롤이 따라 가도록 하였습니다.

</div>
</details>

## 💡 구현 화면




https://github.com/teetee6/wanted_week3/assets/17748068/65bd25f1-8b85-47b6-b07d-9497f488599f


