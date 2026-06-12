import { motion, AnimatePresence } from 'framer-motion';

const particles = Array.from({ length: 40 });

const LevelUpVFX = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
          {particles.map((_, i) => {
            const angle = (Math.PI * 2 * i) / particles.length;
            const velocity = 100 + Math.random() * 200;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            const size = Math.random() * 6 + 2;

            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: tx,
                  y: ty,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 1 + Math.random(),
                  ease: "easeOut",
                }}
                className="absolute bg-sl-blue rounded-full shadow-[0_0_10px_rgba(74,158,255,0.8)]"
                style={{ width: size, height: size }}
              />
            );
          })}
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute w-64 h-64 bg-sl-blue/20 rounded-full blur-3xl mix-blend-screen"
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpVFX;
