import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import eyeAsset from "@/assets/illuminati-eye-dark.png.asset.json";
import { assetUrl } from "@/lib/asset-url";

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
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-6"
            >
              <img
                src={assetUrl(eyeAsset)}
                alt=""
                className="h-28 w-28 object-contain md:h-36 md:w-36"
                style={{ filter: "invert(1) drop-shadow(0 0 30px oklch(0.5 0.24 25 / 0.6))" }}
              />
              <div className="font-[Anton] text-5xl tracking-tight text-white md:text-6xl">
                ILLUMINATI <span style={{ color: "oklch(0.55 0.24 25)" }}>3.0</span>
              </div>
            </motion.div>
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, oklch(0.4 0.24 25 / 0.35), transparent 55%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0.3] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: showIntro ? 0 : 1 }} transition={{ duration: 0.7 }}>
        {children}
      </motion.div>
    </>
  );
}