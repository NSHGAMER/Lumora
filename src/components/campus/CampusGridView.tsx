import React, { useState } from 'react';
import { Sparkles, Server, Zap, Users, Thermometer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { MagneticButton } from '../ui/MagneticButton';
import { CampusNodeGrid } from '../3d/CampusNodeGrid';
import type { CampusBuilding } from '../../types';

interface CampusGridViewProps {
  onOpenJSR: (prompt?: string) => void;
}

export const CampusGridView: React.FC<CampusGridViewProps> = ({ onOpenJSR }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('b1');
  const [reservationDone, setReservationDone] = useState(false);

  const buildings: CampusBuilding[] = [
    {
      id: 'b1',
      name: 'Turing Science Center',
      code: 'TSC',
      occupancyPercent: 68,
      activeWorkstations: 96,
      availableWorkstations: 32,
      temperature: '21.5°C',
      energyGridKw: 420,
      status: 'optimal',
      coordinates: { x: 0, y: 0, z: 0 },
    },
    {
      id: 'b2',
      name: 'Quantum Library & Quiet Zone',
      code: 'QLIB',
      occupancyPercent: 88,
      activeWorkstations: 210,
      availableWorkstations: 28,
      temperature: '20.8°C',
      energyGridKw: 310,
      status: 'busy',
      coordinates: { x: 2, y: 0, z: -2 },
    },
    {
      id: 'b3',
      name: 'Engineering Quad Hub',
      code: 'EQH',
      occupancyPercent: 45,
      activeWorkstations: 120,
      availableWorkstations: 66,
      temperature: '22.1°C',
      energyGridKw: 580,
      status: 'optimal',
      coordinates: { x: -2, y: 0, z: 2 },
    },
    {
      id: 'b4',
      name: 'BioTech Innovation Hub',
      code: 'BIH',
      occupancyPercent: 92,
      activeWorkstations: 50,
      availableWorkstations: 4,
      temperature: '19.5°C',
      energyGridKw: 640,
      status: 'full',
      coordinates: { x: 2, y: 0, z: 2 },
    },
  ];

  const current = buildings.find((b) => b.id === selectedBuilding) || buildings[0];

  const handleBookStation = () => {
    setReservationDone(true);
    setTimeout(() => setReservationDone(false), 4000);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="green" pulse>SPATIAL TELEMETRY ACTIVE</Badge>
            <span className="text-xs font-mono text-slate-400">48 Campus Nodes Sync</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-bold text-white tracking-tight">
            3D Spatial Campus Grid & <span className="text-gradient-cyan">Lab Reservations</span>
          </h1>
          <p className="text-slate-400 font-sans text-xs sm:text-sm mt-1">
            Real-time occupancy tracking, HVAC climate balance, and instantaneous workstation reservation.
          </p>
        </div>

        <MagneticButton
          variant="glow"
          onClick={() => onOpenJSR("Check quiet study pod availability in Quantum Library L3")}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Ask JSR for Study Pod</span>
        </MagneticButton>
      </div>

      {/* 3D Spatial Canvas Visualizer */}
      <CampusNodeGrid />

      {/* Main Grid: Building List & Telemetry Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Building selector */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-heading font-bold text-lg text-white mb-2">
            Campus Facilities Telemetry
          </h3>

          {buildings.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBuilding(b.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedBuilding === b.id
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-glass-glow'
                  : 'bg-slate-900/60 border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-cyan-400">{b.code}</span>
                  <span className="font-heading font-semibold text-white text-sm">{b.name}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Available Workstations: <span className="text-emerald-400 font-bold">{b.availableWorkstations}</span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono capitalize ${
                    b.status === 'optimal'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : b.status === 'busy'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {b.occupancyPercent}% Full
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Building Details & Instant Reservation Form */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard glowColor="cyan" className="space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400">{current.code} FACILITY TELEMETRY</span>
                <h3 className="text-2xl font-heading font-bold text-white">{current.name}</h3>
              </div>
              <Badge variant={current.status === 'optimal' ? 'green' : 'amber'}>
                {current.status.toUpperCase()}
              </Badge>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-center">
                <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-xs font-mono text-slate-400">OCCUPANCY</div>
                <div className="text-lg font-bold text-white">{current.occupancyPercent}%</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-center">
                <Server className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-xs font-mono text-slate-400">OPEN STATIONS</div>
                <div className="text-lg font-bold text-emerald-400">{current.availableWorkstations}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-center">
                <Thermometer className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                <div className="text-xs font-mono text-slate-400">CLIMATE HVAC</div>
                <div className="text-lg font-bold text-white">{current.temperature}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-center">
                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-xs font-mono text-slate-400">ENERGY LOAD</div>
                <div className="text-lg font-bold text-white">{current.energyGridKw} kW</div>
              </div>
            </div>

            {/* Instant Reservation Container */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  INSTANT LAB STATION RESERVATION
                </span>
                <span>JWT VERIFIED</span>
              </div>

              {reservationDone ? (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-xs font-mono">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">Reservation Confirmed!</div>
                    <div>Station Node assigned at {current.name}. Passkey sent to your Lumora Wallet.</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 font-sans">
                    Reserve a high-performance workstation with GPU hardware acceleration at {current.name} for up to 3 hours.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <select className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500">
                      <option>2 Hours (Standard)</option>
                      <option>3 Hours (Extended Research)</option>
                      <option>1 Hour (Quick Test)</option>
                    </select>

                    <button
                      onClick={handleBookStation}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-heading font-medium text-xs shadow-accent-cyan hover:shadow-cyan-500/50 transition-all cursor-pointer"
                    >
                      Reserve Station Now
                    </button>
                  </div>
                </div>
              )}
            </div>

          </GlassCard>
        </div>

      </div>

    </div>
  );
};
