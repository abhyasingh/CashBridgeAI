import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Play, 
  Sparkles
} from 'lucide-react';

export const CashBridgeHeroStory: React.FC = () => {
  const { i18n } = useTranslation();
  const isHindi = i18n.language.startsWith('hi');

  // Stages:
  // 1: Draw cash line (0s - 2.5s)
  // 2: Dip below buffer & red hatch pulses (2.5s - 4.5s)
  // 3: Alert tag & confidence band appears (4.5s - 6.5s)
  // 4: Saffron bridge arc draws over gap (6.5s - 9.0s)
  // 5: Cash lifts, red zone dissolves, teal tick stamp lands (9.0s - 11.5s)
  const [stage, setStage] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setReducedMotion(true);
        setStage(5); // Static final resolved frame
        setIsPlaying(false);
      }
    }
  }, []);

  // 12-second total loop timer
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;

    const timer = setInterval(() => {
      setStage((prev) => {
        if (prev >= 5) return 1;
        return prev + 1;
      });
    }, 2400); // 5 stages * 2.4s = 12 seconds loop

    return () => clearInterval(timer);
  }, [isPlaying, reducedMotion]);

  // Stage steps label for interactive scrubber
  const stepLabels = [
    { num: 1, labelEn: '1. Cash Flow', labelHi: '1. बहीखाता' },
    { num: 2, labelEn: '2. Buffer Dip', labelHi: '2. कमी की शुरुआत' },
    { num: 3, labelEn: '3. Gap Alert', labelHi: '3. चेतावनी' },
    { num: 4, labelEn: '4. Bridge Loan', labelHi: '4. ब्रिज लोन' },
    { num: 5, labelEn: '5. Secured', labelHi: '5. समाधान' },
  ];

  return (
    <div className="w-full bg-[#F5EFE1] border-2 border-paper-line rounded-md shadow-ledger-lg overflow-hidden flex flex-col relative">
      {/* Ledger Header / Index Tabs */}
      <div className="bg-[#EBE2CF] px-4 py-2.5 border-b border-paper-ruled flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-saffron" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-primary">
            12s Story Simulation • {isHindi ? '13-सप्ताह बहीखाता' : '13-Week Cash Ledger'}
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-ink-muted bg-paper-card px-2 py-0.5 rounded border border-paper-ruled">
            Day 0 — Day 91
          </span>
        </div>

        {/* Step Scrubber Pills */}
        <div className="flex items-center space-x-1">
          {stepLabels.map((s) => (
            <button
              key={s.num}
              onClick={() => {
                setStage(s.num);
                setIsPlaying(false);
              }}
              className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                stage === s.num
                  ? 'bg-ink-primary text-paper-bg shadow-xs'
                  : 'text-ink-muted hover:text-ink-primary hover:bg-paper-subtle'
              }`}
            >
              {isHindi ? s.labelHi : s.labelEn}
            </button>
          ))}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="ml-1 p-1 text-ink-muted hover:text-ink-primary rounded hover:bg-paper-subtle"
            title={isPlaying ? 'Pause Loop' : 'Play Loop'}
            aria-label="Toggle Playback"
          >
            {isPlaying ? (
              <span className="text-xs font-mono font-bold px-1">II</span>
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
          </button>
        </div>
      </div>

      {/* Main SVG Animated Story Canvas */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/10] bg-[#FAF7F0] p-2 sm:p-4 select-none overflow-hidden">
        {/* Subtle diagonal ledger hatching pattern defs */}
        <svg className="w-full h-full" viewBox="0 0 840 440" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="brickHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#B83227" strokeWidth="2.5" strokeOpacity="0.4" />
            </pattern>
            <pattern id="tealHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#1E6B5C" strokeWidth="2.5" strokeOpacity="0.25" />
            </pattern>
            <linearGradient id="saffronGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DE6B1F" />
              <stop offset="50%" stopColor="#E88238" />
              <stop offset="100%" stopColor="#D9651C" />
            </linearGradient>
            <linearGradient id="p10p90Fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E2D9C8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#DCD2BD" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Ledger Ruled Background Grid Lines */}
          {[100, 160, 220, 280, 340, 400].map((y) => (
            <line
              key={y}
              x1="70"
              y1={y}
              x2="800"
              y2={y}
              stroke="#E8E0CE"
              strokeWidth="1"
              strokeDasharray={y === 260 ? undefined : "2 2"}
            />
          ))}

          {/* Week Vertical Dividers */}
          {[
            { x: 80, label: 'Today (W1)' },
            { x: 180, label: 'W2 (Day 10)' },
            { x: 280, label: 'W3 (Day 18)' },
            { x: 380, label: 'W4 (Day 24)' },
            { x: 500, label: 'W6 (Day 38)' },
            { x: 650, label: 'W9' },
            { x: 790, label: 'W13' },
          ].map((col) => (
            <g key={col.x}>
              <line x1={col.x} y1="50" x2={col.x} y2="400" stroke="#EFE8D7" strokeWidth="1" />
              <text x={col.x} y="420" fill="#7A8794" fontSize="10" fontFamily="monospace" textAnchor="middle">
                {col.label}
              </text>
            </g>
          ))}

          {/* Currency Y-Axis Labels */}
          <text x="65" y="105" fill="#7A8794" fontSize="10" fontFamily="monospace" textAnchor="end">₹5.0L</text>
          <text x="65" y="165" fill="#7A8794" fontSize="10" fontFamily="monospace" textAnchor="end">₹4.0L</text>
          <text x="65" y="225" fill="#7A8794" fontSize="10" fontFamily="monospace" textAnchor="end">₹3.0L</text>
          <text x="65" y="264" fill="#B83227" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="end">₹2.5L</text>
          <text x="65" y="345" fill="#7A8794" fontSize="10" fontFamily="monospace" textAnchor="end">₹1.0L</text>
          <text x="65" y="402" fill="#7A8794" fontSize="10" fontFamily="monospace" textAnchor="end">₹0</text>

          {/* 1. Minimum Safe Buffer Line (₹2.5L) */}
          <line
            x1="70"
            y1="260"
            x2="800"
            y2="260"
            stroke="#B83227"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.85"
          />
          <text x="795" y="254" fill="#B83227" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="end">
            {isHindi ? 'न्यूनतम सुरक्षित बफर (₹2.5L)' : 'Minimum Safe Buffer (₹2.5L)'}
          </text>

          {/* 2. Deficit Red Hatched Zone (Visible when stage >= 2, dissolves at stage 5) */}
          <AnimatePresence>
            {stage >= 2 && stage < 5 && (
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.65, 0.95, 0.65] }}
                exit={{ opacity: 0, transition: { duration: 0.8 } }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                d="M 215 260 C 240 280, 260 370, 280 370 C 310 370, 340 320, 360 300 C 385 275, 400 263, 412 260 Z"
                fill="url(#brickHatch)"
                stroke="#B83227"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}
          </AnimatePresence>

          {/* Resolved Safe Teal Fill Zone (Visible at stage 5) */}
          <AnimatePresence>
            {stage === 5 && (
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.8 }}
                d="M 215 260 C 240 240, 260 215, 280 205 C 310 200, 340 215, 360 210 C 385 220, 400 240, 420 260 Z"
                fill="url(#tealHatch)"
              />
            )}
          </AnimatePresence>

          {/* 3. Confidence Envelope Shading (P10 to P90 band - visible at stage >= 3) */}
          {stage >= 3 && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              d="M 80 120 C 130 140, 160 190, 200 215 C 240 240, 260 330, 280 330 C 310 330, 340 280, 360 260 C 420 210, 470 170, 500 160 C 580 130, 680 100, 790 70 L 790 125 C 680 155, 580 185, 500 215 C 470 225, 420 275, 360 325 C 340 345, 310 395, 280 395 C 260 395, 240 295, 200 260 C 160 225, 130 175, 80 155 Z"
              fill="url(#p10p90Fill)"
              stroke="#D2C5AC"
              strokeWidth="0.8"
            />
          )}

          {/* 4. The Cash Line (Draws across in stage 1, dips in stage 2-4, lifts in stage 5) */}
          {/* Base Unbridged Dip Line */}
          <motion.path
            d="M 80 140 C 130 160, 160 210, 200 240 C 240 270, 260 370, 280 370 C 310 370, 340 320, 360 300 C 420 250, 470 200, 500 190 C 580 160, 680 130, 790 100"
            fill="none"
            stroke="#111A24"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: stage === 1 ? 0.35 : 1,
              opacity: stage === 5 ? 0.25 : 1
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Stage 5 Lifted Resolved Cash Line */}
          {stage === 5 && (
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.0, ease: 'easeInOut' }}
              d="M 80 140 C 130 160, 160 210, 200 240 C 230 245, 250 210, 280 205 C 310 200, 340 220, 360 210 C 420 190, 470 170, 500 160 C 580 140, 680 120, 790 90"
              fill="none"
              stroke="#1E6B5C"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}

          {/* 5. Saffron Bridge Parabolic Arc (Draws in stage 4, stays in stage 5) */}
          {stage >= 4 && (
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              d="M 230 245 Q 365 105, 500 190"
              fill="none"
              stroke="url(#saffronGlow)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="8 3"
            />
          )}

          {/* Bridge Anchor Dots */}
          {stage >= 4 && (
            <>
              <circle cx="230" cy="245" r="5" fill="#D9651C" />
              <circle cx="500" cy="190" r="5" fill="#D9651C" />
            </>
          )}

          {/* Key Event Milestones Text */}
          <text x="180" y="275" fill="#526071" fontSize="9" fontFamily="monospace" textAnchor="middle">
            Payroll (₹1.15L)
          </text>
          <text x="240" y="295" fill="#526071" fontSize="9" fontFamily="monospace" textAnchor="middle">
            GST (₹1.4L)
          </text>
          <text x="500" y="175" fill="#1E6B5C" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            Kapoor Pays (₹1.85L)
          </text>
        </svg>

        {/* Dynamic HTML Callout Overlays */}
        {/* Stage 3 & 4: Day 18 Deficit Alert Pin */}
        <AnimatePresence>
          {stage >= 3 && stage < 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-[33%] top-[68%] -translate-x-1/2 -translate-y-1/2 bg-white/95 border-2 border-brick-danger rounded-[3px] shadow-lg px-2.5 py-1.5 z-20 flex items-center space-x-2"
            >
              <div className="w-6 h-6 rounded-full bg-brick-tint text-brick-danger flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-extrabold text-brick-danger font-sans uppercase tracking-tight">
                  {isHindi ? '18वां दिन: ₹2.1L की कमी' : 'Day 18 Shortfall: ₹2.1L'}
                </p>
                <p className="text-[9px] text-ink-muted font-mono">
                  {isHindi ? '82% मॉडल सटीकता' : '82% Model Confidence'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 4 & 5: Saffron Bridge Loan Floating Banner */}
        <AnimatePresence>
          {stage >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute left-[44%] top-[25%] -translate-x-1/2 bg-[#FFF9F3] border-2 border-saffron rounded-[3px] shadow-md px-3 py-1.5 z-20 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-saffron shrink-0" />
              <div>
                <p className="text-xs font-bold text-saffron uppercase font-sans tracking-wide">
                  {isHindi ? 'CashBridge: ₹2.3L • 21 दिन' : 'CashBridge: ₹2.3L • 21 Days'}
                </p>
                <p className="text-[9px] text-ink-muted">
                  {isHindi ? 'कपूर बिल क्लियर होने पर ऑटो-रीपे' : 'Auto-repays on Kapoor invoice clear'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage 5: Liquidity Secured Rubber Stamp */}
        <AnimatePresence>
          {stage === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 1.6, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute right-[12%] top-[40%] bg-teal-tint/95 border-2 border-teal-safe text-teal-safe px-4 py-2 rounded-[2px] shadow-stamp z-30 flex items-center space-x-2 select-none"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-safe" />
              <div className="leading-tight">
                <span className="block font-black text-sm uppercase tracking-widest font-sans">
                  {isHindi ? 'तरलता सुरक्षित (SECURED)' : 'LIQUIDITY SECURED'}
                </span>
                <span className="block text-[9px] text-teal-safe/80 font-mono">
                  {isHindi ? 'वेतन व GST समय पर' : 'Payroll & GST on schedule'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Narrative Footer Strip */}
      <div className="bg-[#EFE8D7] px-4 py-2 border-t border-paper-ruled flex items-center justify-between text-xs text-ink-secondary">
        <div className="flex items-center space-x-2 truncate">
          <ShieldCheck className="w-4 h-4 text-teal-safe shrink-0" />
          <span className="font-semibold text-ink-primary">
            {stage === 1 && (isHindi ? 'चरण 1: 12-महीने के बिलों से सामान्य कैश बैलेंस का प्रवाह।' : 'Phase 1: Normal operating cashflow synced from Tally Prime.')}
            {stage === 2 && (isHindi ? 'चरण 2: 18वें दिन ग्राहक बिल की देरी से बैलेंस ₹2.5L बफर से नीचे।' : 'Phase 2: Customer delays plunge projected cash below ₹2.5L safety buffer.')}
            {stage === 3 && (isHindi ? 'चरण 3: ₹2,10,000 की संभावित कमी का अलर्ट 18 दिन पहले जारी।' : 'Phase 3: Day 18 shortfall alert generated with 82% confidence.')}
            {stage === 4 && (isHindi ? 'चरण 4: ₹2.3L का 21-दिवसीय ब्रिज लोन ठीक उस कमी को पाटता है।' : 'Phase 4: Saffron bridge micro-loan calculated to bridge the exact deficit.')}
            {stage === 5 && (isHindi ? 'चरण 5: न कोई चेक बाउंस, न कर्मचारियों की चिंता। बिल आते ही स्वतः चुकता।' : 'Phase 5: Cashflow restored above buffer. Zero payroll panic. Auto-repaid.')}
          </span>
        </div>
        <span className="font-mono text-[11px] text-ink-muted shrink-0 pl-2">
          {stage} / 5
        </span>
      </div>
    </div>
  );
};
