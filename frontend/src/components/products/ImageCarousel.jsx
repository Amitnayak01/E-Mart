import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageCarousel({ images = [] }) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);

  // zoom + pan
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });

  // touch pinch
  const pinchRef = useRef({
    active: false,
    startDistance: 0,
    startScale: 1
  });

  const safe = images.length ? images : [{ url: "" }];

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const resetView = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  const prev = () => {
    setIdx((p) => (p - 1 + safe.length) % safe.length);
    resetView();
  };

  const next = () => {
    setIdx((p) => (p + 1) % safe.length);
    resetView();
  };

  // ESC close + disable scroll + keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKey);

    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
    // eslint-disable-next-line
  }, [open]);

  // when modal opens or image changes
  useEffect(() => {
    resetView();
  }, [open, idx]);

  const onWheelZoom = (e) => {
    if (!open) return;

    e.preventDefault();
    const delta = e.deltaY;

    // zoom speed
    const step = delta > 0 ? -0.12 : 0.12;
    const nextScale = clamp(scale + step, 1, 4);

    // if back to 1 => reset position
    if (nextScale === 1) {
      setScale(1);
      setPos({ x: 0, y: 0 });
      return;
    }

    setScale(nextScale);
  };

  const startDrag = (clientX, clientY) => {
    if (scale <= 1) return;
    setDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    lastPosRef.current = { ...pos };
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragging || scale <= 1) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    // clamp pan (so image doesn't fly away)
    const max = 280 * (scale - 1); // dynamic clamp
    const nx = clamp(lastPosRef.current.x + dx, -max, max);
    const ny = clamp(lastPosRef.current.y + dy, -max, max);

    setPos({ x: nx, y: ny });
  };

  const endDrag = () => setDragging(false);

  const onDoubleClick = (e) => {
    e.preventDefault();
    if (scale === 1) {
      setScale(2);
    } else {
      resetView();
    }
  };

  // touch helpers
  const getDistance = (t1, t2) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current.active = true;
      pinchRef.current.startDistance = getDistance(e.touches[0], e.touches[1]);
      pinchRef.current.startScale = scale;
      return;
    }

    // single touch drag
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e) => {
    if (pinchRef.current.active && e.touches.length === 2) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const ratio = dist / pinchRef.current.startDistance;
      const nextScale = clamp(pinchRef.current.startScale * ratio, 1, 4);
      setScale(nextScale);

      if (nextScale === 1) setPos({ x: 0, y: 0 });
      return;
    }

    if (e.touches.length === 1) {
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    pinchRef.current.active = false;
    endDrag();
  };

  return (
    <>
      {/* Normal Carousel */}
      <div className="rounded-2xl bg-white shadow-soft border overflow-hidden">
        {/* Main Image */}
      
      <div
  role="button"
  tabIndex={0}
  onClick={() => safe[idx]?.url && setOpen(true)}
  onKeyDown={(e) => e.key === "Enter" && safe[idx]?.url && setOpen(true)}
  className="relative h-[360px] bg-black flex items-center justify-center w-full cursor-zoom-in"
  title="Click to view full screen"
>

          {safe[idx]?.url ? (
            <img
              src={safe[idx].url}
              alt="product"
              className="max-h-[360px] w-full object-contain"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-100">
              No image
            </div>
          )}

          {safe.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow"
              >
                <ChevronLeft />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow"
              >
                <ChevronRight />
              </button>
            </>
          )}

          {safe[idx]?.url && (
            <div className="absolute bottom-3 right-3 text-xs bg-white/90 px-3 py-1 rounded-full font-bold text-slate-900">
              Click to expand
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {safe.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto bg-white">
            {safe.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-16 w-20 rounded-xl overflow-hidden border ${
                  i === idx ? "border-slate-900" : "border-slate-200"
                }`}
              >
                {img.url ? (
                  <img src={img.url} alt="thumb" className="h-16 w-20 object-cover" />
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FULL SCREEN MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
              <div className="text-sm font-bold">
                {idx + 1} / {safe.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScale((s) => clamp(s - 0.2, 1, 4))}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-bold"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setScale((s) => clamp(s + 0.2, 1, 4))}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-bold"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-bold"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                  title="Close"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Image Area */}
            <div
              className="flex-1 flex items-center justify-center relative px-4"
              onWheel={onWheelZoom}
              onClick={() => setOpen(false)}
            >
              {/* Image */}
              <motion.img
                key={safe[idx]?.url}
                src={safe[idx]?.url}
                alt="fullscreen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                draggable={false}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={onDoubleClick}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startDrag(e.clientX, e.clientY);
                }}
                onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onTouchStart(e);
                }}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                  cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
                  transition: dragging ? "none" : "transform 120ms ease"
                }}
                className="max-h-[82vh] max-w-full object-contain select-none"
              />

              {/* Controls */}
              {safe.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prev();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                  >
                    <ChevronLeft className="text-white w-7 h-7" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      next();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
                  >
                    <ChevronRight className="text-white w-7 h-7" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbs */}
            {safe.length > 1 && (
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2 overflow-x-auto">
                  {safe.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIdx(i)}
                      className={`h-16 w-24 rounded-xl overflow-hidden border transition ${
                        i === idx ? "border-white" : "border-white/20"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt="thumb"
                        className="h-16 w-24 object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-white/60 mt-2">
                  Tip: Mouse wheel to zoom • Double click to zoom • Drag to move • Press{" "}
                  <b>ESC</b> to close
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
