import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Activity, Zap, MessageSquare, Terminal, RefreshCw, BarChart2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { JSRCoreSphere } from '../3d/JSRCoreSphere';

export const JSRCoreSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const coreScale = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0.9, 1.1, 1.25]);
  const coreGlowOpacity = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [0.4, 0.9, 0.5]);

  // Dynamic floating command chips loop
  const commandList = [
    'Searching timetable...',
    'Attendance analyzed...',
    'Finding classroom...',
    'Generating report...',
    'Department synced...',
    'Predicting workload...',
    'Optimizing schedule...',
  ];

  const [activeCommandIdx, setActiveCommandIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCommandIdx((prev) => (prev + 1) % commandList.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [commandList.length]);

  const capabilityCards = [
    {
      id: 'cap-1',
      title: 'Natural Language',
      icon: MessageSquare,
      description: 'Students can simply ask natural questions. No complex forms or keyword hunting.',
      badge: 'NATIVE LLM',
    },
    {
      id: 'cap-2',
      title: 'Campus Intelligence',
      icon: Activity,
      description: 'Real-time academic telemetry across all departments, labs, and student profiles.',
      badge: 'LIVE TELEMETRY',
    },
    {
      id: 'cap-3',
      title: 'Workflow Automation',
      icon: Zap,
      description: 'Seamless integration with n8n webhooks to automate grading, registration, and room holds.',
      badge: 'N8N PIPELINES',
    },
    {
      id: 'cap-4',
      title: 'Predictive Analytics',
      icon: BarChart2,
      description: 'AI-powered recommendations for workload balancing, GPA modeling, and faculty retention.',
      badge: 'NEURAL FORECAST',
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-[180vh] py-32 px-4 sm:px-6 bg-[#05070B] overflow-hidden flex flex-col justify-between"
    >
      {/* Background Animated Grid & Ambient Fog */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0" />
      <motion.div
        style={{ opacity: coreGlowOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-radial from-cyan-500/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-24">
        
        {/* Header Title & Subtitle */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2"
          >
            <Badge variant="cyan" pulse>
              LUMORA AI ENGINE
            </Badge>
            <span className="text-xs font-mono text-slate-400">NEURAL KERNEL v4.2</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight"
          >
            Meet <span className="text-gradient-cyan">JSR.</span> <br />
            The Intelligent Campus Engine.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-300 font-sans font-light leading-relaxed max-w-3xl mx-auto"
          >
            I don&apos;t simply answer questions. I understand your campus. <br className="hidden sm:inline" />
            I automate workflows. I assist faculty. I guide students. <br />
            I help administrators make smarter decisions. <span className="text-cyan-400 font-semibold font-heading">I become the intelligence behind Lumora.</span>
          </motion.p>
        </div>

        {/* Centerpiece 3D Holographic AI Core Chamber */}
        <div className="relative py-12 flex flex-col items-center justify-center">
          
          {/* Floating Command Chips Overlay (Top Left & Top Right) */}
          <div className="absolute top-0 left-4 sm:left-12 z-20 hidden md:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCommandIdx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="px-4 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-glass-glow flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>{commandList[activeCommandIdx]}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute top-12 right-4 sm:right-12 z-20 hidden md:block">
            <div className="px-3.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>SYNAPSE_BANDWIDTH: 10GB/s</span>
            </div>
          </div>

          {/* HUD Concentric Scanning Rings Backdrop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full border border-cyan-500/20 animate-pulse-slow" />
            <div className="absolute w-[440px] h-[440px] sm:w-[620px] sm:h-[620px] rounded-full border border-purple-500/15 border-dashed animate-spin-slow" />
          </div>

          {/* 3D Holographic AI Core Sphere */}
          <motion.div style={{ scale: coreScale }} className="relative z-10">
            <JSRCoreSphere />
          </motion.div>

          {/* Voice Frequency Waveform Visualizer */}
          <div className="mt-8 relative z-20 flex items-center justify-center gap-1 bg-slate-950/80 px-6 py-3 rounded-full border border-cyan-500/30 backdrop-blur-md shadow-2xl">
            <Terminal className="w-4 h-4 text-cyan-400 mr-2" />
            <span className="text-xs font-mono text-cyan-300 mr-4">JSR Voice Synth</span>
            
            {/* Animated Wave Bars */}
            {[40, 75, 100, 60, 90, 45, 80, 100, 65, 30, 85, 50].map((h, i) => (
              <motion.span
                key={i}
                animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.08,
                  ease: 'easeInOut',
                }}
                className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full h-6 inline-block"
              />
            ))}
          </div>

        </div>

        {/* 4 Floating Capability Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          {capabilityCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
              >
                <GlassCard
                  glowColor={idx % 2 === 0 ? 'cyan' : 'purple'}
                  interactive={true}
                  className="h-full hover:border-cyan-500/40"
                  contentClassName="justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-heading font-bold text-white tracking-wide">
                      {card.title}
                    </h3>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between" aria-label="AI capability pipeline active">
                    <span>AI ARCHITECTURE PIPELINE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" aria-hidden="true" />
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
