import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Shield, Sparkles, Activity } from 'lucide-react';

export const OperatingSystemMetrics: React.FC = () => {
  const metrics = [
    { label: 'JSR AI Inference Latency', value: '12ms', icon: Cpu, change: '-42% vs legacy LMS' },
    { label: 'Campus Telemetry Nodes', value: '14,200+', icon: Activity, change: '100% Online' },
    { label: 'AI Course Optimization', value: '99.8%', icon: Sparkles, change: 'Zero scheduling overlaps' },
    { label: 'Energy Grid Efficiency', value: '94.2%', icon: Zap, change: 'Saved 340 MWh/mo' },
    { label: 'Security & Auth Trust', value: '99.99%', icon: Shield, change: 'Zero Trust Architecture' },
  ];

  return (
    <section className="py-12 border-y border-white/10 bg-[#0A1019]/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="space-y-1 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Icon className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  <span>{item.label}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <span aria-hidden="true">↑</span>
                  <span>{item.change}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
