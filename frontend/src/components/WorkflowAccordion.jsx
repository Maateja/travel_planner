import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './WorkflowAccordion.css';

const DEFAULT_WORKFLOW = [
  {
    step: '01',
    headline: 'Choose your destination',
    bullets: ['Goa Beaches', 'Manali Hills', 'Jaipur Heritage', 'Kerala Backwaters'],
    baseClass: 'wa-base-dest'
  },
  {
    step: '02',
    headline: 'Enter travel dates & travellers',
    bullets: ['Flexible Dates', 'Solo Explorer', 'Friends / Family Group'],
    baseClass: 'wa-base-dates'
  },
  {
    step: '03',
    headline: 'Set your budget',
    bullets: ['Student Friendly', 'Real-time ₹ Tracking', 'Cost Breakdown'],
    baseClass: 'wa-base-budget'
  },
  {
    step: '04',
    headline: 'Generate with AI or organize manually',
    bullets: ['Instant Gemini Roadmap', 'Manual Day Architect', '100% Flexible Editing'],
    baseClass: 'wa-base-ai'
  },
  {
    step: '05',
    headline: 'Review the roadmap & save your trip',
    bullets: ['Interactive Route Map', '1-Click Save', 'Accessible Anytime'],
    baseClass: 'wa-base-save'
  }
];

// ==========================================
// CARD 1: Realistic Destination Slideshow (Pure images in loop, no emojis/tags)
// ==========================================
const DESTINATION_IMAGES = [
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80', // Tropical Beach
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80', // Mountain Peaks
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80', // Heritage Architecture
  'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80'  // Serene Backwaters
];

const DestinationLoopBg = () => (
  <div className="wa-bg-container">
    {DESTINATION_IMAGES.map((url, idx) => (
      <div
        key={idx}
        className={`wa-photo-slide wa-photo-slide--${idx + 1}`}
        style={{ backgroundImage: `url(${url})` }}
      />
    ))}
  </div>
);

// ==========================================
// CARD 2: Realistic Travel Packing & Clean Departure Countdown
// ==========================================
const DatesCountdownBg = () => (
  <div className="wa-bg-container">
    {/* Real Travel Packing Background Photo */}
    <div 
      className="wa-static-photo" 
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80)' }}
    />
    
    {/* Clean Minimal Departure Schedule Widget (No emojis) */}
    <div className="wa-card2-overlay">
      <div className="wa-schedule-box">
        <div className="wa-schedule-header">
          <span className="wa-status-dot" />
          <span className="wa-schedule-title">DEPARTURE COUNTDOWN</span>
        </div>
        
        <div className="wa-digits-row">
          <div className="wa-digit-block">
            <span className="wa-digit-val">03</span>
            <span className="wa-digit-lbl">DAYS</span>
          </div>
          <span className="wa-digit-colon">:</span>
          <div className="wa-digit-block">
            <span className="wa-digit-val">14</span>
            <span className="wa-digit-lbl">HOURS</span>
          </div>
          <span className="wa-digit-colon">:</span>
          <div className="wa-digit-block">
            <span className="wa-digit-val">42</span>
            <span className="wa-digit-lbl">MINS</span>
          </div>
        </div>

        <div className="wa-date-range">
          <span>OCTOBER 14 — OCTOBER 21</span>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// CARD 3: Realistic Budget Planning & Allocation
// ==========================================
const BudgetCounterBg = () => (
  <div className="wa-bg-container">
    {/* Real Financial Planning Background Photo */}
    <div 
      className="wa-static-photo" 
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80)' }}
    />

    {/* Clean Modern Budget Tracker (No emojis) */}
    <div className="wa-card3-overlay">
      <div className="wa-budget-widget">
        <div className="wa-budget-header">
          <span className="wa-budget-label">TOTAL ALLOCATED BUDGET</span>
          <span className="wa-budget-total">₹18,500</span>
        </div>

        <div className="wa-progress-list">
          <div className="wa-progress-row">
            <div className="wa-progress-meta">
              <span>Accommodation</span>
              <span>₹7,400 (40%)</span>
            </div>
            <div className="wa-track"><div className="wa-fill wa-fill--1" /></div>
          </div>

          <div className="wa-progress-row">
            <div className="wa-progress-meta">
              <span>Food & Cafes</span>
              <span>₹4,625 (25%)</span>
            </div>
            <div className="wa-track"><div className="wa-fill wa-fill--2" /></div>
          </div>

          <div className="wa-progress-row">
            <div className="wa-progress-meta">
              <span>Local Transit</span>
              <span>₹3,700 (20%)</span>
            </div>
            <div className="wa-track"><div className="wa-fill wa-fill--3" /></div>
          </div>

          <div className="wa-progress-row">
            <div className="wa-progress-meta">
              <span>Activities & Passes</span>
              <span>₹2,775 (15%)</span>
            </div>
            <div className="wa-track"><div className="wa-fill wa-fill--4" /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// CARD 4: Realistic Generative AI Synthesis
// ==========================================
const AIGenerationBg = () => (
  <div className="wa-bg-container">
    {/* Real Generative Neural Wave Background Photo */}
    <div 
      className="wa-static-photo" 
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80)' }}
    />

    {/* Clean AI Itinerary Architect (No emojis) */}
    <div className="wa-card4-overlay">
      <div className="wa-ai-widget">
        <div className="wa-ai-status">
          <span className="wa-ai-pulse-dot" />
          <span className="wa-ai-status-title">AI ITINERARY ARCHITECT</span>
        </div>

        <div className="wa-ai-blocks">
          <div className="wa-ai-item wa-ai-item--1">
            <span className="wa-ai-pill">DAY 01</span>
            <span className="wa-ai-text">Coastal Trails & Sunset Point</span>
          </div>
          <div className="wa-ai-item wa-ai-item--2">
            <span className="wa-ai-pill">DAY 02</span>
            <span className="wa-ai-text">Historic Fort & Heritage Walk</span>
          </div>
          <div className="wa-ai-item wa-ai-item--3">
            <span className="wa-ai-pill">DAY 03</span>
            <span className="wa-ai-text">Artisan Markets & Riverside Cafes</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// CARD 5: Realistic Road Trip Landscape & Verified Save
// ==========================================
const RoadmapSaveBg = () => (
  <div className="wa-bg-container">
    {/* Real Scenic Open Highway Landscape Photo */}
    <div 
      className="wa-static-photo" 
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80)' }}
    />

    {/* Clean Roadmap Path & Verified Stamp (No emojis) */}
    <div className="wa-card5-overlay">
      <div className="wa-roadmap-widget">
        <svg className="wa-route-path-svg" viewBox="0 0 300 80" fill="none">
          <path
            d="M 15 65 C 80 15, 170 85, 285 20"
            stroke="rgba(251, 191, 36, 0.6)"
            strokeWidth="3"
            strokeDasharray="6 6"
            className="wa-dash-animation"
          />
          <circle cx="15" cy="65" r="4.5" fill="#38bdf8" />
          <circle cx="140" cy="52" r="4" fill="#fbbf24" />
          <circle cx="285" cy="20" r="5" fill="#10b981" />
        </svg>

        <div className="wa-verified-box">
          <div className="wa-check-icon">✓</div>
          <div className="wa-verified-details">
            <span className="wa-verified-title">ROADMAP SAVED TO CLOUD</span>
            <span className="wa-verified-meta">12 Stops • 420 KM • Profile Synced</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const renderCardBackground = (step) => {
  switch (step) {
    case '01':
      return <DestinationLoopBg />;
    case '02':
      return <DatesCountdownBg />;
    case '03':
      return <BudgetCounterBg />;
    case '04':
      return <AIGenerationBg />;
    case '05':
      return <RoadmapSaveBg />;
    default:
      return null;
  }
};

const WorkflowAccordion = ({
  items = DEFAULT_WORKFLOW,
  defaultIndex = 0,
  duration = 0.5,
  ease = 'power3.out',
  tilt = 6
}) => {
  const rootRef = useRef(null);
  const panelRefs = useRef([]);
  const contentRefs = useRef([]);
  const tlRef = useRef(null);
  const firstRunRef = useRef(true);

  const count = items.length;
  const [active, setActive] = useState(defaultIndex);

  const applyLayout = useCallback(
    animate => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

      tlRef.current?.kill();
      const dur = animate ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const content = contentRefs.current[i];

        if (!isMobile) {
          const rot = isActive ? 0 : i < active ? tilt : -tilt;
          tl.to(
            panel,
            {
              flexGrow: isActive ? 3.8 : 1,
              rotateY: rot,
              duration: dur,
              ease
            },
            0
          );
        }

        // When opened: Headline + Bullets appear
        if (content) {
          tl.to(
            content,
            {
              opacity: isActive ? 1 : 0,
              y: isActive ? 0 : 16,
              duration: dur,
              ease,
              delay: isActive && animate ? 0.08 : 0
            },
            0
          );
        }
      });

      tlRef.current = tl;
    },
    [active, duration, ease, tilt]
  );

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(() => {
    const handleResize = () => {
      applyLayout(false);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      tlRef.current?.kill();
    };
  }, [applyLayout]);

  const handleSelect = index => {
    setActive(index);
  };

  return (
    <div
      ref={rootRef}
      className="workflow-accordion"
      role="list"
      aria-label="Workflow Steps Accordion"
    >
      {items.map((item, i) => {
        const isActive = i === active;

        return (
          <div
            key={item.step}
            ref={el => (panelRefs.current[i] = el)}
            className={`wa-panel ${item.baseClass}${isActive ? ' wa-panel--active' : ''}`}
            onClick={() => handleSelect(i)}
            onMouseEnter={() => handleSelect(i)}
            role="listitem"
            tabIndex={0}
            aria-expanded={isActive}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(i);
              }
            }}
          >
            <div className="wa-panel__inner">
              {/* Base Color: visible in collapsed state */}
              <div className="wa-panel__base-layer" />

              {/* Unique Visual Animation: ONLY visible when card is OPEN */}
              <div className="wa-panel__bg-animation">
                {renderCardBackground(item.step)}
              </div>

              {/* Overlay gradient for high contrast and text readability */}
              <div className="wa-panel__overlay" />

              {/* Collapsed Step Badge: Visible ONLY when card is NOT opened */}
              <div className="wa-panel__collapsed-badge">
                <div className="wa-panel__pill" />
                <span className="wa-panel__number">{item.step}</span>
                <div className="wa-panel__pill" />
              </div>

              {/* Expanded Card Content: Headline + Bullet points */}
              <div
                ref={el => (contentRefs.current[i] = el)}
                className="wa-panel__content"
              >
                <h3 className="wa-panel__headline">
                  {item.headline}
                </h3>

                <ul className="wa-panel__bullets">
                  {item.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="wa-panel__bullet-item">
                      <svg
                        viewBox="0 0 100 100"
                        className="wa-panel__bullet-icon"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M 41.5 29 L 59 50 L 41.5 71" />
                      </svg>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowAccordion;
