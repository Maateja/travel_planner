import { useState } from 'react';
import FoldText from './FoldText';
import './TextFill.css';

const HEADLINE = 'Let AI Plan the Journey With You.';

/**
 * Two-layer headline: FoldText reveals first, then a scenic text-fill
 * overlay crossfades in so the letters become filled with a slowly
 * panning travel landscape (beach, mountains, greenery, mist).
 */
export default function ScenicFoldHeadline() {
  const [foldDone, setFoldDone] = useState(false);

  const headingClasses =
    'max-w-[14ch] text-[clamp(2.95rem,6.2vw,7rem)] font-black uppercase leading-[0.96] tracking-tight font-display text-center lg:text-left';

  return (
    <div className="relative">
      {/* Layer 1: FoldText (plain dark text that folds in) */}
      <h2
        className={`${headingClasses} text-gray-900`}
        style={{
          opacity: foldDone ? 0 : 1,
          transition: 'opacity 0.8s ease-out',
        }}
      >
        <FoldText
          text={HEADLINE}
          foldStyle="paper"
          splitBy="char"
          hinge="top"
          trigger="scroll"
          foldAngle={92}
          duration={0.65}
          stagger={0.045}
          staggerFrom="start"
          ease="power3.out"
          perspective={700}
          creaseShading={0.55}
          fontSize="inherit"
          fontWeight={900}
          onComplete={() => setFoldDone(true)}
        />
      </h2>

      {/* Layer 2: scenic text-fill (crossfades in after fold completes) */}
      <h2
        aria-hidden="true"
        className={`${headingClasses} text-fill-scenic absolute inset-0`}
        style={{
          opacity: foldDone ? 1 : 0,
          transition: 'opacity 1.2s ease-in',
          pointerEvents: 'none',
        }}
      >
        {HEADLINE}
      </h2>
    </div>
  );
}

