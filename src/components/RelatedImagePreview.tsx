import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type RelatedImagePreviewProps = {
  imageSrc: string | null;
  entryId: string;
  weekLabel: string;
  accent: string;
  assetName: string | null;
};

export function RelatedImagePreview({
  imageSrc,
  entryId,
  weekLabel,
  accent,
  assetName,
}: RelatedImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageSrc]);

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!imageSrc || hasError) {
    return (
      <div className="grid gap-3 rounded-[24px] border border-dashed border-black/15 bg-[#f7f3ec] p-4 text-black shadow-[0_12px_24px_rgba(16,16,16,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="m-0 text-[11px] font-black uppercase tracking-[0.18em] text-black">
            Related card
          </h4>
          {assetName ? (
            <span
              className="rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ borderColor: accent, color: accent }}
            >
              {assetName}
            </span>
          ) : null}
        </div>
        <p className="m-0 text-[14px] leading-6 text-black/60">
          No related image is available for this Week 1 participant yet.
        </p>
      </div>
    );
  }

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Related image preview"
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-[26px] bg-[#f8f5ef] shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-4 md:px-6">
          <div>
            <p className="m-0 text-[11px] uppercase tracking-[0.18em] text-black/50">{weekLabel}</p>
            <h3 className="m-0 mt-1 text-[20px] font-black tracking-[-0.04em] text-black md:text-[28px]">
              {assetName ?? `Related image #${entryId}`}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={imageSrc}
              download={`${assetName ?? `week1-related-${entryId}`}.jpg`}
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
            alt={`${weekLabel} related card image for entry ${entryId}`}
            className="h-auto w-full rounded-[20px] border border-black/10 bg-white object-contain"
            onError={() => setHasError(true)}
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="group relative block w-full overflow-hidden rounded-[22px] border border-black/15 bg-white text-left shadow-[0_14px_24px_rgba(16,16,16,0.08)] transition-transform duration-300 hover:-translate-y-0.5"
        onClick={() => setIsOpen(true)}
      >
        {assetName ? (
          <span
            className="absolute left-3 top-3 z-10 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
            style={{ borderColor: accent, backgroundColor: "rgba(16,16,16,0.44)" }}
          >
            {assetName}
          </span>
        ) : null}

        <img
          src={imageSrc}
          alt={`${weekLabel} related card image for entry ${entryId}`}
          className="aspect-[1.42/1] h-auto w-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-3 py-3 text-white">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Open related image</span>
          <span
            className="rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ borderColor: accent, backgroundColor: "rgba(16,16,16,0.18)" }}
          >
            Download jpg
          </span>
        </div>
      </button>

      {typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
    </>
  );
}