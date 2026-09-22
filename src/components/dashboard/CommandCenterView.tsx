import React, { useState } from 'react';
import { Sparkles, Activity, Clock, CheckSquare, Server, ArrowUpRight, Zap } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { MagneticButton } from '../ui/MagneticButton';
import type { SystemRole } from '../../types';

interface CommandCenterViewProps {
  role: SystemRole;
  onOpenJSR: (prompt?: string) => void;
  onSelectTab: (tab: any) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  role,
  onOpenJSR,
  onSelectTab,
}) => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Submit Quantum Machine Learning Lab #4', due: 'Today, 11:59 PM', completed: false, course: 'CS401' },
    { id: '2', title: 'Review JSR AI Syllabus Recommendations for Spring 2027', due: 'Tomorrow', completed: true, course: 'ACADEMIC' },
    { id: '3', title: 'Confirm GPU Station B-12 Reservation in Turing Hall', due: 'Wed, 2:00 PM', completed: false, course: 'RESEARCH' },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" pulse>COMMAND CENTER ACTIVE</Badge>
            <span className="text-xs font-mono text-slate-400 capitalize">Role: {role} Mode</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-bold text-white tracking-tight">
            Welcome back, <span className="text-gradient-cyan">Alex Vance</span>
          </h1>
          <p className="text-slate-400 font-sans text-xs sm:text-sm mt-1">
            All system nodes, JSR AI models, and campus telemetry grids are performing at optimal capacity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MagneticButton variant="glow" onClick={() => onOpenJSR()}>
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Launch JSR Assistant</span>
          </MagneticButton>
        </div>
      </div>

      {/* Primary Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <GlassCard glowColor="blue" className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>WEEKLY WORKLOAD INDEX</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">7.4</span>
            <span className="text-xs font-mono text-slate-400">/ 10 (Balanced)</span>
          </div>
          <p className="text-xs text-slate-400">JSR recommends 2 focus study blocks</p>
        </GlassCard>

        <GlassCard glowColor="cyan" className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>GPU CLUSTER CAPACITY</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">32 / 128</span>
            <span className="text-xs font-mono text-emerald-400">Stations Available</span>
          </div>
          <p className="text-xs text-slate-400">Node B-12 pre-assigned to your profile</p>
        </GlassCard>

        <GlassCard glowColor="purple" className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>CUMULATIVE GPA TRAJECTORY</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">3.92</span>
            <span className="text-xs font-mono text-emerald-400">↑ +0.08 AI Forecast</span>
          </div>
          <p className="text-xs text-slate-400">Top 3.5% of Department</p>
        </GlassCard>

        <GlassCard glowColor="green" className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>JSR AI ASSISTS THIS TERM</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-white">418</span>
            <span className="text-xs font-mono text-slate-400">Queries resolved</span>
          </div>
          <p className="text-xs text-slate-400">Saved 42 estimated research hours</p>
        </GlassCard>

      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Timetable Feed & Tasks */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Today's Schedule Feed */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-white">Today&apos;s Live Course Feed</h3>
                <p className="text-xs text-slate-400 font-mono">Monday, August 3 • 4 Classes Scheduled</p>
              </div>
              <button
                onClick={() => onSelectTab('academics')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                View Full Matrix <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { time: '09:00 - 10:30 AM', code: 'CS401', name: 'Quantum Machine Learning', room: 'Turing Hall 302', prof: 'Dr. Thorne', status: 'live' },
                { time: '11:00 - 12:30 PM', code: 'DS302', name: 'Neural Architecture Design', room: 'Cybernetics Lab B', prof: 'Prof. Vance', status: 'upcoming' },
                { time: '02:00 - 04:00 PM', code: 'RES500', name: 'Quantum Tensor Research Lab', room: 'Turing GPU Station B-12', prof: 'Self-Guided', status: 'upcoming' },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    c.status === 'live'
                      ? 'bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-transparent border-cyan-500/40 shadow-glass-glow'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-slate-950 border border-white/10 text-cyan-400 font-mono text-xs text-center shrink-0">
                      <Clock className="w-4 h-4 mx-auto mb-1" />
                      {c.time.split('-')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300 text-sm">{c.code}</span>
                        <span className="text-sm font-heading text-white">{c.name}</span>
                        {c.status === 'live' && (
                          <Badge variant="cyan" pulse>LIVE NOW</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {c.room} • Instructor: {c.prof}
                      </div>
                    </div>
                  </div>

                  {c.status === 'live' && (
                    <button
                      onClick={() => onOpenJSR(`Give me a summary of lecture notes for ${c.code}`)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-all cursor-pointer shrink-0"
                    >
                      JSR Lecture Assistant
                    </button>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Action Tasks Widget */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cyan-400" />
                Active Academic Deliverables
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {tasks.filter(t => t.completed).length} / {tasks.length} Completed
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    task.completed
                      ? 'bg-slate-950/40 border-white/5 opacity-60 line-through text-slate-400'
                      : 'bg-slate-900/80 border-white/10 hover:border-cyan-500/40 text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                    />
                    <span className="text-sm font-sans">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                      {task.course}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{task.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Right Column: JSR AI Insights & System Log */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* JSR AI Smart Insights Widget */}
          <GlassCard glowColor="cyan" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-heading font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                JSR Proactive Insights
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">
                AI ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs font-sans space-y-1.5">
                <div className="font-semibold text-cyan-300 font-heading">Schedule Optimization Opportunity</div>
                <p className="text-slate-300 leading-relaxed">
                  You have a 2-hour gap on Thursday. JSR suggests pre-registering for the Neural Vectorization Workshop to earn 1 micro-credit.
                </p>
                <button
                  onClick={() => onOpenJSR("Tell me more about the Neural Vectorization Workshop")}
                  className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 pt-1"
                >
                  Ask JSR to Register <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/20 text-xs font-sans space-y-1.5">
                <div className="font-semibold text-purple-300 font-heading">Exam Review Generator Ready</div>
                <p className="text-slate-300 leading-relaxed">
                  Quantum ML Midterm is in 8 days. JSR compiled 24 customized flashcard problems based on your recent quiz scores.
                </p>
                <button
                  onClick={() => onOpenJSR("Start Quantum ML Midterm review practice session")}
                  className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1 pt-1"
                >
                  Start Practice Test <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Quick System Telemetry Log */}
          <GlassCard className="space-y-3">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between border-b border-white/10 pb-2">
              <span>SYSTEM KERNEL EVENTS</span>
              <span className="text-emerald-400">ONLINE</span>
            </div>
            <div className="space-y-2 font-mono text-xs text-slate-400">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span>[14:22:04] GPU_NODE_B12</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span>[14:18:10] OAUTH_JWT_SYNC</span>
                <span className="text-blue-400">AUTHENTICATED</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>[14:05:00] JSR_MODEL_UPDATE</span>
                <span className="text-purple-400">LATENCY 12ms</span>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
};
