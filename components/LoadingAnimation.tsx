import { motion, AnimatePresence } from "framer-motion";
import { Wand2 } from "lucide-react";
import { LoadingStates } from "./constants";
import { useEffect, useState } from "react";

interface LoadingAnimationProps {
  progress: number;
}
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full h-2.5 bg-gray-200/50 rounded-full overflow-hidden relative backdrop-blur-sm">
    <motion.div
      className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 absolute inset-0"
      style={{
        backgroundSize: "200% 100%",
      }}
      initial={{ width: 0, backgroundPosition: "0% 50%" }}
      animate={{
        width: `${progress}%`,
        backgroundPosition: ["0% 50%", "100% 50%"],
      }}
      transition={{
        width: { duration: 0.5, ease: "easeOut" },
        backgroundPosition: {
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        },
      }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  </div>
);

export const LoadingAnimation = ({ progress }: LoadingAnimationProps) => {
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStateIndex((prev) => (prev + 1) % LoadingStates.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="flex items-center justify-center gap-3 h-full px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 1 }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Wand2 className="h-5 w-5 text-blue-400" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.span
            key={loadingStateIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-blue-100 min-w-[140px]"
          >
            {LoadingStates[loadingStateIndex]}
          </motion.span>
        </AnimatePresence>
        <div className="w-32">
          <ProgressBar progress={progress} />
        </div>
      </div>
    </motion.div>
  );
};
