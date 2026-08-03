import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { Quote } from 'lucide-react';

export const TestimonialGrid: React.FC = () => {
  const testimonials = [
    {
      quote: "Lumora completely replaced 7 different fragmented web portals at our institute. Students can check GPU cluster availability, review assignment logic with JSR AI, and manage timetables in one unified, sub-second interface.",
      author: "Dr. Aris Thorne",
      role: "Dean of Computer Science & Engineering",
      institution: "Institute of Advanced Technology",
    },
    {
      quote: "The JSR AI assistant is unlike any chatbot I have seen. It understands our exact quantum mechanics syllabus, detects prerequisite knowledge gaps, and pre-books research pod stations automatically.",
      author: "Elena Rostova",
      role: "Ph.D. Quantum Computing Fellow",
      institution: "Lumora Research Lab",
    },
    {
      quote: "It feels closer to Arc Browser or Linear than a college website. No outdated tables, no ugly forms. It makes managing 18 credit units effortless.",
      author: "Marcus Vance",
      role: "Student Body President",
      institution: "Class of 2027",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
          FACULTY & STUDENT TRUST
        </span>
        <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white">
          Built for Future-Ready Universities.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <GlassCard interactive={true} glowColor={idx === 1 ? 'cyan' : 'blue'} className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <Quote className="w-8 h-8 text-cyan-400 opacity-40" />
                <p className="text-slate-300 font-sans text-sm leading-relaxed italic">
                  &quot;{item.quote}&quot;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-heading font-bold text-white text-sm">
                  {item.author[0]}
                </div>
                <div>
                  <div className="font-heading font-semibold text-white text-sm">
                    {item.author}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{item.role}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">{item.institution}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
