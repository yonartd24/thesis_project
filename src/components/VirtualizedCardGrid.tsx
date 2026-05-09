import { useMemo, useRef } from "react";
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

function useResponsiveColumns() {
  return 1;
}

export function VirtualizedCardGrid({ entries }: VirtualizedCardGridProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const columns = useResponsiveColumns();
  const rows = useMemo(() => chunkEntries(entries, columns), [columns, entries]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (columns === 1 ? 410 : 360),
    overscan: 4,
  });

  if (entries.length <= VIRTUALIZATION_THRESHOLD) {
    return (
      <div className="px-1 sm:px-2 md:mt-10 md:px-3 lg:px-4">
        <div className="mx-auto grid w-full max-w-[1080px] grid-cols-1 gap-y-6 md:gap-y-8">
          {entries.map((card) => (
            <CardEntryCard key={`${card.week_number}-${card.stage}-${card.entry_id}`} card={card} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="">
      <div ref={parentRef} className="h-[76vh] py-6 overflow-auto px-2">
        <div
          className="relative mx-auto w-full max-w-[1080px]"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 top-0 w-full pb-6 md:pb-8"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-1 z-10">
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