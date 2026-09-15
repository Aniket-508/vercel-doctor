"use client";

import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import { useEffect, useRef, useState } from "react";
import { Tweet } from "react-tweet";

import {
  HORRORS_LARGE_BREAKPOINT_PX,
  HORRORS_LARGE_COLUMN_COUNT,
  HORRORS_MEDIUM_BREAKPOINT_PX,
  HORRORS_MEDIUM_COLUMN_COUNT,
  HORRORS_SMALL_COLUMN_COUNT,
  HORROR_TWEETS,
} from "@/constants/horrors";
import type { HorrorTweet } from "@/constants/horrors";

interface TweetCardProps {
  data: HorrorTweet;
}

const TweetCard = ({ data }: TweetCardProps) => (
  <article className="p-2.5">
    <div className="horrors-tweet [&_.react-tweet-theme]:max-w-none">
      <Tweet id={data.id} />
    </div>
  </article>
);

export const TweetGrid = () => {
  const collectionRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(HORRORS_SMALL_COLUMN_COUNT);

  useEffect(() => {
    const collectionElement = collectionRef.current;
    if (!collectionElement) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      let nextColumnCount = HORRORS_SMALL_COLUMN_COUNT;
      if (entry.contentRect.width >= HORRORS_MEDIUM_BREAKPOINT_PX) {
        nextColumnCount = HORRORS_MEDIUM_COLUMN_COUNT;
      }
      if (entry.contentRect.width >= HORRORS_LARGE_BREAKPOINT_PX) {
        nextColumnCount = HORRORS_LARGE_COLUMN_COUNT;
      }

      setColumnCount(nextColumnCount);
    });

    resizeObserver.observe(collectionElement);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={collectionRef} className="w-full">
      <VirtuosoMasonry
        className="-m-2.5"
        columnCount={columnCount}
        data={HORROR_TWEETS}
        initialItemCount={HORROR_TWEETS.length}
        ItemContent={TweetCard}
        useWindowScroll
      />
    </div>
  );
};
