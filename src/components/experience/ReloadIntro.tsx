import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function ReloadIntro({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
              style={{ willChange: "opacity" }}
            >
              <div className="font-[Anton] text-5xl tracking-tight text-white md:text-6xl">
                ILLUMINATI <span style={{ color: "oklch(0.55 0.24 25)" }}>3.0</span>
              </div>
            </motion.div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06), transparent 60%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ opacity: showIntro ? 0 : 1, transition: "opacity 0.5s ease-out" }}>
        {children}
      </div>
    </>
  );
}