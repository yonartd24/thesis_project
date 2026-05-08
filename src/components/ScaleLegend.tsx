const scaleTicks = [1, 2, 3, 4, 5];

type ScaleLegendProps = {
  accent?: string;
};

export function ScaleLegend({ accent = "#7c7c7c" }: ScaleLegendProps) {
  return (
    <div className="px-1 sm:px-2 md:px-5" aria-hidden="true">
      <div className="grid grid-cols-5 gap-2 sm:gap-4 md:gap-7">
        {scaleTicks.map((tick) => (
          <div key={tick} className="flex flex-col items-center gap-1.5 text-black">
            <span className="text-[18px] font-black leading-none tracking-[-0.04em] md:text-[28px]">
              {tick}
            </span>
            <div
              className="h-3 w-4"
              style={{
                clipPath: "polygon(50% 100%, 0 0, 100% 0)",
                background: accent,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
