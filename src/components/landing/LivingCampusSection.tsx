import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Cpu, Users, Zap, ShieldCheck, Activity } from 'lucide-react';
import { LivingCampusCanvas } from '../3d/LivingCampusCanvas';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';

export const LivingCampusSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const canvasScale = useTransform(scrollYProgress, [0.1, 0.4, 0.8], [0.92, 1, 1.04]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.9], [0.3, 0.8, 0.4]);

  const hudMetrics = [
    { label: 'STUDENTS ONLINE', value: '18,420', change: '100% Synced', icon: Users, color: 'text-cyan-400' },
    { label: 'FACULTY ACTIVE', value: '640', change: '48 Departments', icon: ShieldCheck, color: 'text-blue-400' },
    { label: 'AI INFERENCE LATENCY', value: '12ms', change: '-42% vs Legacy', icon: Cpu, color: 'text-purple-400' },
    { label: 'AUTOMATION PIPELINES', value: '99.8%', change: 'n8n Active', icon: Zap, color: 'text-emerald-400' },
    { label: 'ENERGY GRID SCORE', value: '94.2%', change: '340 MWh Saved', icon: Activity, color: 'text-cyan-400' },
  ];

  const techStackChips = [
    { label: 'JSR Intelligence Engine', badge: 'AI CORE' },
    { label: 'FastAPI Microservices', badge: 'BACKEND' },
    { label: 'MongoDB Atlas Grid', badge: 'DATABASE' },
    { label: 'n8n Workflow Automation', badge: 'PIPELINES' },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-[220vh] py-32 px-4 sm:px-6 bg-[#05070B] overflow-hidden flex flex-col justify-between"
    >
      {/* Background Animated Grid & Ambient Fog */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0" />
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-radial from-cyan-500/20 via-blue-600/10 to-transparent blur-3xl pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-20">
        
        {/* Header Heading & Subtitle */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2"
          >
            <Badge variant="cyan" pulse>
              DIGITAL TWIN INFRASTRUCTURE
            </Badge>
            <span className="text-xs font-mono text-slate-400">REAL-TIME NERVOUS SYSTEM</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight"
          >
            A Campus <br className="hidden sm:inline" />
            <span className="text-gradient-cyan">That Thinks.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-300 font-sans font-light leading-relaxed max-w-3xl mx-auto"
          >
            Every building. Every classroom. Every department. Every student. Every faculty member. <br />
            <span className="text-cyan-400 font-semibold font-heading">Connected by one intelligent operating system.</span>
          </motion.p>
        </div>

        {/* Real-time Telemetry HUD Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {hudMetrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <GlassCard glowColor="cyan" className="p-4 space-y-1 hover:border-cyan-500/40">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{item.label}</span>
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-heading font-bold text-white tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    {item.change}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Digital Twin 3D Blueprint Canvas */}
        <motion.div style={{ scale: canvasScale }} className="relative z-10">
          <LivingCampusCanvas />
        </motion.div>

        {/* Bottom Transition Architecture Chips */}
        <div className="pt-16 text-center space-y-8">
          
          <div className="text-xs font-mono tracking-wider text-slate-400">
            Powered by High-Performance Architecture
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {techStackChips.map((chip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/40 text-slate-200 text-xs font-mono backdrop-blur-xl shadow-lg flex items-center gap-3"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold">{chip.label}</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">
                  {chip.badge}
                </span>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
