'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImpactGlobeProps {
  kgSaved: number;
}

/**
 *  Impact Globe function.
 * @param props - Component properties.
 * @param props.kgSaved - Semantic unit for kgSaved.
 * @returns Shape or unit of the return value.
 * @throws {never} This function does not throw.
 */
export default function ImpactGlobe({ kgSaved }: ImpactGlobeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const treeCount = Math.max(Math.round(kgSaved / 22), 1);

  const startCinema = () => {
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, 4500); // 4-second sequence
  };

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-6 shadow-sm flex flex-col items-center">
      <h3 className="text-lg font-display font-bold text-forest-900 self-start mb-2">Cinematic Impact</h3>
      <p className="text-xs text-slateBlue-500 font-sans self-start mb-6">Narrating your environmental contributions</p>

      <div className="relative w-full h-64 bg-forest-900 rounded-2xl flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!isPlaying ? (
            <motion.div
              key="static"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center px-4"
            >
              <div className="text-5xl mb-4">🌳</div>
              <p className="text-white text-sm font-sans font-medium mb-4">
                You saved <span className="text-amberAlert-500 font-bold">{kgSaved.toFixed(1)} kg</span> of CO2 this week.
              </p>
              <button
                onClick={startCinema}
                className="px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider font-sans transition-all duration-200"
              >
                🎥 Play Impact Cinema
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-forest-900"
            >
              {/* Particle effects */}
              <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-forest-200"
                    initial={{
                      x: '50%',
                      y: '80%',
                      opacity: 0.8,
                      scale: 0.5,
                    }}
                    animate={{
                      x: [`${30 + Math.random() * 40}%`, `${10 + Math.random() * 80}%`],
                      y: ['80%', '0%'],
                      opacity: [0.8, 0],
                      scale: [0.5, 1.5],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              {/* Animated Growing Tree/Seed */}
              <motion.div
                initial={{ scale: 0.1, y: 50, opacity: 0 }}
                animate={{ scale: [0.1, 1, 1.2, 1], y: [50, 0, 0, 0], opacity: 1 }}
                transition={{ duration: 2, times: [0, 0.5, 0.8, 1] }}
                className="text-7xl mb-4 z-10"
              >
                🌱
              </motion.div>

              {/* Text Narration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: [0, 0, 1], y: [20, 20, 0] }}
                transition={{ duration: 3.5, times: [0, 0.6, 1] }}
                className="z-10 px-4"
              >
                <h4 className="text-xl font-display font-bold text-amberAlert-100">
                  Equivalent to planting {treeCount} mature tree{treeCount > 1 ? 's' : ''}!
                </h4>
                <p className="text-xs text-forest-100 mt-2 font-sans">
                  Your actions directly mitigate climate warming.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
