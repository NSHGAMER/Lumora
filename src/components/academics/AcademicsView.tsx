import React, { useState } from 'react';
import { Calendar, Sparkles, Clock, Layers, CheckCircle, BarChart3 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { MagneticButton } from '../ui/MagneticButton';
import type { Course } from '../../types';

interface AcademicsViewProps {
  onOpenJSR: (prompt?: string) => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({ onOpenJSR }) => {
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');

  const courses: Course[] = [
    {
      id: 'c1',
      code: 'CS401',
      name: 'Quantum Machine Learning',
      professor: 'Dr. Aris Thorne',
      room: 'Turing Hall 302',
      time: '09:00 AM - 10:30 AM',
      day: 'Mon',
      credits: 4,
      workloadScore: 8.5,
      color: 'from-blue-600 to-cyan-500',
      enrolled: 48,
      capacity: 50,
    },
    {
      id: 'c2',
      code: 'DS302',
      name: 'Neural Architecture Design',
      professor: 'Prof. Marcus Vance',
      room: 'Cybernetics Lab B',
      time: '11:00 AM - 12:30 PM',
      day: 'Mon',
      credits: 4,
      workloadScore: 7.2,
      color: 'from-purple-600 to-cyan-500',
      enrolled: 42,
      capacity: 45,
    },
    {
      id: 'c3',
      code: 'MATH350',
      name: 'Linear Algebra for AI & Tensors',
      professor: 'Dr. Sarah Lin',
      room: 'Euler Science Hall 101',
      time: '02:00 PM - 03:30 PM',
      day: 'Tue',
      credits: 3,
      workloadScore: 6.8,
      color: 'from-cyan-600 to-emerald-500',
      enrolled: 60,
      capacity: 60,
    },
    {
      id: 'c4',
      code: 'RES500',
      name: 'Quantum Tensor Research Lab',
      professor: 'Self-Guided / Fellow',
      room: 'Turing GPU Station B-12',
      time: '02:00 PM - 05:00 PM',
      day: 'Wed',
      credits: 4,
      workloadScore: 9.0,
      color: 'from-purple-600 to-blue-600',
      enrolled: 12,
      capacity: 15,
    },
    {
      id: 'c5',
      code: 'ETH410',
      name: 'AI Ethics & Autonomous Governance',
      professor: 'Dr. Sophia Reed',
      room: 'Humanities Center 204',
      time: '10:00 AM - 11:30 AM',
      day: 'Thu',
      credits: 3,
      workloadScore: 4.5,
      color: 'from-emerald-600 to-cyan-500',
      enrolled: 38,
      capacity: 40,
    },
  ];

  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const filteredCourses = courses.filter((c) => c.day === selectedDay);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" pulse>SMART ACADEMICS MATRIX</Badge>
            <span className="text-xs font-mono text-slate-400">Fall 2026 Semester</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-bold text-white tracking-tight">
            Intelligent Course & <span className="text-gradient-cyan">Workload Manager</span>
          </h1>
          <p className="text-slate-400 font-sans text-xs sm:text-sm mt-1">
            Zero-conflict schedule optimization, prerequisite pathway modeling, and GPA trajectory forecasting.
          </p>
        </div>

        <MagneticButton
          variant="primary"
          onClick={() => onOpenJSR("Analyze my current course load balance and suggest study optimization")}
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>JSR Workload Audit</span>
        </MagneticButton>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard glowColor="blue">
          <div className="text-xs font-mono text-slate-400 mb-1">TOTAL ENROLLED CREDITS</div>
          <div className="text-3xl font-heading font-bold text-white">18 Units</div>
          <p className="text-xs text-emerald-400 font-mono mt-1">✓ Meets Dean Honors load threshold</p>
        </GlassCard>

        <GlassCard glowColor="cyan">
          <div className="text-xs font-mono text-slate-400 mb-1">COMBINED WORKLOAD SCORE</div>
          <div className="text-3xl font-heading font-bold text-cyan-400">7.2 / 10</div>
          <p className="text-xs text-slate-400 font-mono mt-1">Balanced cognitive distribution</p>
        </GlassCard>

        <GlassCard glowColor="purple">
          <div className="text-xs font-mono text-slate-400 mb-1">PROJECTED TERM GPA</div>
          <div className="text-3xl font-heading font-bold text-purple-400">3.94 / 4.0</div>
          <p className="text-xs text-emerald-400 font-mono mt-1">↑ +0.06 AI confidence index</p>
        </GlassCard>
      </div>

      {/* Main Schedule Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Weekly Timetable */}
        <div className="lg:col-span-8 space-y-4">
          <GlassCard className="space-y-4">
            
            {/* Day Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Weekly Schedule Matrix
              </h3>
              
              <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
                {days.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      selectedDay === d
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Schedule List */}
            <div className="space-y-3 pt-2">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-all space-y-3 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-white bg-gradient-to-r ${c.color}`}>
                          {c.code}
                        </span>
                        <h4 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                          {c.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{c.credits} Credits</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Workload {c.workloadScore}/10
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1 border-t border-white/5">
                      <span className="flex items-center gap-1.5 text-cyan-400">
                        <Clock className="w-3.5 h-3.5" /> {c.time}
                      </span>
                      <span>Location: {c.room}</span>
                      <span>Instructor: {c.professor}</span>
                      <span className="text-emerald-400">Enrolled: {c.enrolled}/{c.capacity}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                  No registered classes on {selectedDay}. Dedicated study & focus block recommended by JSR AI.
                </div>
              )}
            </div>

          </GlassCard>
        </div>

        {/* Right Column: Prerequisite Graph & GPA Simulator */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Prerequisite Node Graph Mock */}
          <GlassCard glowColor="cyan" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Degree Prerequisite Tree
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">CS MAJOR</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                <span>✓ CS101: Algorithmic Foundations</span>
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
                <span>✓ CS202: Data Structures & Graphs</span>
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <div className="p-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 flex items-center justify-between font-bold">
                <span>➔ CS401: Quantum ML (Current)</span>
                <Badge variant="cyan">IN PROGRESS</Badge>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-between opacity-70">
                <span>🔒 CS505: Advanced Quantum Computing II</span>
                <span className="text-[10px]">SPRING 2027</span>
              </div>
            </div>

            <button
              onClick={() => onOpenJSR("Show me all course prerequisites needed for Senior Capstone Research")}
              className="w-full text-center text-xs font-mono text-cyan-400 hover:underline pt-1 block cursor-pointer"
            >
              Ask JSR for custom degree map →
            </button>
          </GlassCard>

          {/* AI GPA Forecast Card */}
          <GlassCard glowColor="purple" className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono text-slate-400">GPA FORECAST ENGINE</span>
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Quantum Machine Learning</span>
                <span className="font-mono text-emerald-400">Target: A (4.0)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Neural Architecture</span>
                <span className="font-mono text-emerald-400">Target: A (4.0)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>AI Ethics Governance</span>
                <span className="font-mono text-cyan-400">Target: A- (3.7)</span>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
};
