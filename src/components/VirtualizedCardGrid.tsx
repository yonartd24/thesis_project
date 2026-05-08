import { useMemo, useRef, useState, useLayoutEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { CardEntry } from "../types/card";
import { CardEntryCard } from "./WeekOneCard";

type VirtualizedCardGridProps = {
  entries: CardEntry[];
};

const VIRTUALIZATION_THRESHOLD = 72;

function chunkEntries(entries: CardEntry[], columns: number) {
  const rows: CardEntry[][] = [];

  for (let index = 0; index < entries.length; index += columns) {
    rows.push(entries.slice(index, index + columns));
  }

  return rows;
}

function useResponsiveColumns(containerRef: React.RefObject<HTMLDivElement>) {
  const [columns, setColumns] = useState(1);

  useLayoutEffect(() => {
    const node = containerRef.current;

    if (!node || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;

      if (width >= 1180) {
        setColumns(3);
        return;
      }

      if (width >= 760) {
        setColumns(2);
        return;
      }

      setColumns(1);
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [containerRef]);

  return columns;
}

export function VirtualizedCardGrid({ entries }: VirtualizedCardGridProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const columns = useResponsiveColumns(parentRef);
  const rows = useMemo(() => chunkEntries(entries, columns), [columns, entries]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (columns === 1 ? 390 : 360),
    overscan: 4,
  });

  if (entries.length <= VIRTUALIZATION_THRESHOLD || columns === 1) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-8 md:mt-10 md:grid-cols-2 md:gap-10 xl:grid-cols-3">
        {entries.map((card) => (
          <CardEntryCard key={`${card.week_number}-${card.stage}-${card.entry_id}`} card={card} />
        ))}
      </div>
    );
  }

  return (
    <section className="mt-10">
      <div ref={parentRef} className="h-[76vh] overflow-auto pr-2">
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid gap-8 pb-8 md:gap-10 md:pb-10"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {rows[virtualRow.index].map((card) => (
                  <CardEntryCard key={`${card.week_number}-${card.stage}-${card.entry_id}`} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}