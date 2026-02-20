import React from 'react';
import { motion } from 'framer-motion';

const RouteAnimation = ({ className = "", colorStart = "#0d9488", colorEnd = "#9333ea", variant = "default" }) => {
  const isWide = variant === "wide";
  const viewBox = isWide ? "0 0 1000 200" : "0 0 400 120";
  const pathD = isWide 
    ? "M 50 100 C 300 250, 700 250, 950 100" 
    : "M 40 80 C 120 20, 280 20, 360 80";

  return (
    <div className={`relative flex items-center justify-center overflow-visible ${className}`}>
        <svg viewBox={viewBox} className="w-full h-full drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={`routeGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorStart} />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
            
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <style>
              {`
                @keyframes pulse-pin {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.2); opacity: 0.8; }
                }
                .pin-pulse {
                  transform-origin: center;
                  animation: pulse-pin 2s infinite ease-in-out;
                }
              `}
            </style>
          </defs>

          {/* The Main Curved Dotted Route */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={`url(#routeGradient-${variant})`}
            strokeWidth={isWide ? "3" : "4"}
            strokeLinecap="round"
            strokeDasharray="1, 12"
            initial={{ strokeDashoffset: 1000, opacity: 0 }}
            animate={{ strokeDashoffset: 0, opacity: 1 }}
            transition={{ 
                duration: isWide ? 4 : 2.5, 
                ease: "easeInOut",
                opacity: { duration: 1 }
            }}
            style={{ filter: 'url(#softGlow)' }}
          />

          {/* Drawing Overlay */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={`url(#routeGradient-${variant})`}
            strokeWidth={isWide ? "3" : "4"}
            strokeLinecap="round"
            strokeDasharray="2000"
            initial={{ strokeDashoffset: 2000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ 
                duration: isWide ? 4 : 2.5, 
                ease: "easeInOut"
            }}
            opacity="0.2"
          />

          {/* Moving Dot Highlight */}
          {!isWide && (
            <motion.circle
              r="5"
              fill="white"
              initial={{ opacity: 0 }}
              animate={{ 
                  opacity: [0, 1, 1, 0],
              }}
              style={{
                  offsetPath: `path('${pathD}')`,
              }}
              transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2.5
              }}
            >
              <animateMotion 
                  path={pathD} 
                  dur="3s" 
                  repeatCount="indefinite" 
                  begin="2.5s"
              />
            </motion.circle>
          )}

          {/* Start Location Pin */}
          <motion.g
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <circle cx={isWide ? "50" : "40"} cy={isWide ? "100" : "80"} r={isWide ? "10" : "12"} fill={colorStart} fillOpacity="0.2" className="pin-pulse" />
            <circle cx={isWide ? "50" : "40"} cy={isWide ? "100" : "80"} r={isWide ? "6" : "8"} fill={colorStart} className="drop-shadow-md" />
            <circle cx={isWide ? "50" : "40"} cy={isWide ? "100" : "80"} r="2" fill="white" />
          </motion.g>

          {/* End Location Pin */}
          <motion.g
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: isWide ? 3.5 : 2, type: "spring", stiffness: 200 }}
          >
            <circle cx={isWide ? "950" : "360"} cy={isWide ? "100" : "80"} r={isWide ? "10" : "12"} fill={colorEnd} fillOpacity="0.2" className="pin-pulse" style={{ animationDelay: '1s' }} />
            <circle cx={isWide ? "950" : "360"} cy={isWide ? "100" : "80"} r={isWide ? "6" : "8"} fill={colorEnd} className="drop-shadow-md" />
            <circle cx={isWide ? "950" : "360"} cy={isWide ? "100" : "80"} r="2" fill="white" />
          </motion.g>
        </svg>
    </div>
  );
};

export default RouteAnimation;
