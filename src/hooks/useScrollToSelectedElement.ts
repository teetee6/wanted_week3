import { useEffect } from 'react';

// Custom Hook
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
