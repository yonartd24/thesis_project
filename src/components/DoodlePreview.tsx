import { useEffect, useMemo, useState } from "react";
import { DOODLE_PLACEHOLDER_PATH, resolveDoodleImageUrl } from "../lib/cards";

type DoodlePreviewProps = {
  doodleStoragePath: string | null;
  entryId: string;
  weekLabel: string;
  accent: string;
};

export function DoodlePreview({ doodleStoragePath, entryId, weekLabel, accent }: DoodlePreviewProps) {
  const resolvedSource = useMemo(
    () => resolveDoodleImageUrl(doodleStoragePath),
    [doodleStoragePath],
  );
  const [imageSrc, setImageSrc] = useState(resolvedSource);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setImageSrc(resolvedSource);
  }, [resolvedSource]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="group relative block w-full overflow-hidden rounded-[20px] border border-black/15 bg-white text-left shadow-[0_14px_24px_rgba(16,16,16,0.08)] transition-transform duration-300 hover:-translate-y-0.5"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={imageSrc}
          alt={`${weekLabel} card back for entry ${entryId}`}
          className="aspect-[1.58/1] h-auto w-full object-cover"
          loading="lazy"
          onError={() => setImageSrc(DOODLE_PLACEHOLDER_PATH)}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/65 to-transparent px-3 py-3 text-white">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Open large</span>
          <span
            className="rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ borderColor: accent, backgroundColor: "rgba(16,16,16,0.18)" }}
          >
            Download ready
          </span>
        </div>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-[26px] bg-[#f8f5ef] shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-4 md:px-6">
              <div>
                <p className="m-0 text-[11px] uppercase tracking-[0.18em] text-black/50">{weekLabel}</p>
                <h3 className="m-0 mt-1 text-[20px] font-bold tracking-[-0.04em] text-black md:text-[28px]">
                  Card back #{entryId}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={imageSrc}
                  download={`card-back-${entryId}.svg`}
                  className="rounded-full border border-black px-4 py-2 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-black hover:text-white"
                >
                  Download
                </a>
                <button
                  type="button"
                  className="rounded-full border border-black/15 bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-black hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="bg-[#ebe6dd] p-4 md:p-6">
              <img
                src={imageSrc}
                alt={`${weekLabel} card back for entry ${entryId}`}
                className="h-auto w-full rounded-[20px] border border-black/10 bg-white object-contain"
                onError={() => setImageSrc(DOODLE_PLACEHOLDER_PATH)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}