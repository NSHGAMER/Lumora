import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Network, Clock, Sparkles, Activity, ShieldAlert } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const ProblemSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Background opacity and scale transforms for smooth Hero transition
  const bgGlowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.8], [0.2, 0.8, 0.3]);
  const whatIfOpacity = useTransform(scrollYProgress, [0.55, 0.68, 0.78], [0, 1, 0]);
  const logoRevealOpacity = useTransform(scrollYProgress, [0.78, 0.88, 1], [0, 1, 1]);
  const logoScale = useTransform(scrollYProgress, [0.78, 0.9], [0.8, 1]);

  // Canvas ambient background network nodes animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodeCount = 35;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connecting lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const problemCards = [
    {
      id: 'p1',
      title: 'Fragmented Systems',
      icon: Network,
      color: 'cyan',
      description: 'Attendance. Timetable. Departments. Notices. Everything exists separately without intelligent synchronization.',
      metrics: '7+ Unconnected Portals',
    },
    {
      id: 'p2',
      title: 'Manual Operations',
      icon: Clock,
      color: 'blue',
      description: 'Faculty spend countless hours on repetitive administrative work instead of teaching and ground-breaking research.',
      metrics: '15+ Admin Hrs / Wk Lost',
    },
    {
      id: 'p3',
      title: 'No Artificial Intelligence',
      icon: Sparkles,
      color: 'purple',
      description: 'No intelligent assistant. No predictive insights. No automation. No smart recommendations for student success.',
      metrics: 'Zero Predictive Models',
    },
    {
      id: 'p4',
      title: 'Limited Visibility',
      icon: Activity,
      color: 'green',
      description: 'Administrators cannot monitor the health, resource utilization, or academic telemetry of the campus in real time.',
      metrics: 'Blindspots in Campus Health',
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative py-28 px-4 sm:px-6 overflow-hidden bg-[#05070B] min-h-screen flex flex-col justify-center"
    >
      {/* Background Connecting Nodes Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none z-0" />

      {/* Ambient Blue Glowing Radial Light */}
      <motion.div
        style={{ opacity: bgGlowOpacity }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial from-cyan-500/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-24">
        
        {/* Main Heading & Subtitle */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>THE STATUS QUO PROBLEM</span>
          </motion.div>

          {/* Cinematic Large Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white leading-tight tracking-tight"
          >
            Universities Generate Data. <br className="hidden sm:inline" />
            <span className="text-gradient-cyan">Very Few Generate Intelligence.</span>
          </motion.h2>

          {/* Detailed Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-300 font-sans font-light leading-relaxed max-w-3xl mx-auto"
          >
            Thousands of students. Hundreds of faculty. Multiple departments. Millions of academic records. <br className="hidden md:inline" />
            Yet most campuses still rely on disconnected systems, repetitive manual work, and outdated workflows. <br />
            <span className="font-semibold text-white font-heading text-cyan-400">Lumora changes everything.</span>
          </motion.p>
        </div>

        {/* 4 Problem Glass Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problemCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
              >
                <GlassCard
                  glowColor={card.color as any}
                  interactive={true}
                  className="h-full flex flex-col justify-between p-6 space-y-4 hover:border-cyan-500/40"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 shadow-inner">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white tracking-wide">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 text-[11px] font-mono text-cyan-400/80 flex items-center justify-between">
                    <span>{card.metrics}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Dramatic Sentence & Logo Power-On Reveal Transition */}
        <div className="py-24 text-center space-y-16">
          
          {/* Centered Dramatic Question */}
          <motion.div style={{ opacity: whatIfOpacity }} className="space-y-4">
            <h3 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight">
              What if... <br />
              <span className="text-gradient">your campus could think?</span>
            </h3>
          </motion.div>

          {/* Logo Power-On Reveal into Section 3 */}
          <motion.div
            style={{ opacity: logoRevealOpacity, scale: logoScale }}
            className="relative flex flex-col items-center justify-center space-y-4 pt-8"
          >
            {/* Glowing Ring Core */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 shadow-2xl shadow-cyan-500/50 p-0.5 animate-glow-pulse">
              <div className="w-full h-full bg-[#05070B] rounded-[22px] flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400">
                INTRODUCING
              </span>
              <h4 className="text-4xl sm:text-5xl font-heading font-black tracking-widest text-white">
                LUMORA
              </h4>
            </div>
            
            <p className="text-xs font-mono text-slate-400 max-w-sm">
              System Kernel Initialized • Telemetry Grid Powered On
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
