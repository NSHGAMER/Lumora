import React from 'react';
import { Shield, ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface PrivacyPolicyViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onSelectTab }) => {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-10">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <button
          onClick={() => onSelectTab('home')}
          className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Campus Hub</span>
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="cyan" pulse>
            <Shield className="w-3 h-3" />
            <span>Institutional Legal Protocol</span>
          </Badge>
          <span className="text-xs font-mono text-slate-500">
            Last Revised: September 2026
          </span>
        </div>
      </div>

      {/* Hero Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
          <FileText className="w-3.5 h-3.5" />
          <span>Governance & Data Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-slate-400 font-sans text-sm sm:text-base max-w-3xl leading-relaxed">
          Lumora is engineered as an intelligent campus operating system designed to safeguard institutional, academic, and personal data. This document outlines our data architecture, user rights, and processing protocols.
        </p>

        {/* Prototype Disclaimer Notice */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs font-mono text-amber-300/90">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-200">Prototype Specification Notice:</strong> This privacy document establishes the architectural framework for the Lumora Campus OS prototype. Specific official institutional policies and legal representations are to be provided by the deploying university authority upon production deployment.
          </p>
        </div>
      </div>

      {/* Document Sections */}
      <div className="space-y-8 font-sans text-sm sm:text-base text-slate-300">
        
        {/* Section 1: Overview */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">01.</span> Overview
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Lumora serves higher education communities by coordinating academic schedules, campus telemetry, administrative workflows, and AI-assisted interactions. We adhere to principles of data minimization, transparent processing, and strict role-based access control across all system layers.
          </p>
        </GlassCard>

        {/* Section 2: Information We Collect */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">02.</span> Information We Collect
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            We collect only the information necessary to fulfill institutional workflows:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-300 font-mono pl-2">
            <li><strong className="text-white">Identity Credentials:</strong> Institutional ID number, user role designation, and username.</li>
            <li><strong className="text-white">Academic Records:</strong> Course enrollments, timetable slots, workload metrics, and departmental affiliations.</li>
            <li><strong className="text-white">Facility Telemetry:</strong> Anonymized campus building occupancy counters, workstation availability, and environmental sensor readings.</li>
            <li><strong className="text-white">Interaction Telemetry:</strong> JSR assistant prompts, command palette queries, and feature usage statistics.</li>
          </ul>
        </GlassCard>

        {/* Section 3: How Information Is Used */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">03.</span> How Information Is Used
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Collected data is utilized strictly to provide operating system functions, including generating personalized course schedules, balancing workstation capacity, answering campus queries via JSR, and routing administrative notifications. We do not monetize, sell, or license institutional data to commercial data brokers.
          </p>
        </GlassCard>

        {/* Section 4: Authentication and Account Information */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">04.</span> Authentication and Account Information
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            User authentication utilizes cryptographically salted and hashed passwords (Argon2/Bcrypt) alongside stateless JSON Web Tokens (JWT). In accordance with Lumora's core engineering rules, account creation does not require email confirmation or third-party SMTP verification; accounts are provisioned and activated upon verified backend validation.
          </p>
        </GlassCard>

        {/* Section 5: Academic and Institutional Data */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">05.</span> Academic and Institutional Data
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Institutional records remain the property of the educational institution. Access is partitioned using Role-Based Access Control (RBAC) ensuring students access only their individual records, faculty access assigned course rosters, and administrators manage platform telemetry.
          </p>
        </GlassCard>

        {/* Section 6: AI Assistant / JSR Data Handling */}
        <GlassCard interactive={false} glowColor="cyan" className="space-y-3 border-cyan-500/20">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">06.</span> AI Assistant / JSR Data Handling
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Queries submitted to <strong>JSR — The Intelligence</strong> are processed in real time to synthesize answers and coordinate specialized campus agents. Prompts are sanitized to remove confidential credentials. Interaction history is retained temporarily for session context and is isolated from external model training corpora.
          </p>
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono text-cyan-300">
            Rule: JSR never exposes fabricated institutional records as factual data.
          </div>
        </GlassCard>

        {/* Section 7: Communication and Automation */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">07.</span> Communication and Automation
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Where integrated with workflow engines such as n8n, automated triggers dispatch urgent campus notifications, schedule alerts, or human escalation tickets. Communication channels operate exclusively upon explicit institutional configuration.
          </p>
        </GlassCard>

        {/* Section 8: Data Retention */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">08.</span> Data Retention
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Personal data is retained only for the duration of the student or faculty member's active institutional affiliation, subject to university archival requirements. Session logs and telemetry aggregations are pruned periodically in accordance with institutional policy.
          </p>
        </GlassCard>

        {/* Section 9: Data Security */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">09.</span> Data Security
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Lumora enforces end-to-end transport layer security (HTTPS/TLS 1.3), parameterized database queries to eliminate injection vectors, strict CORS restrictions, and zero client-side exposure of database credentials or signing keys.
          </p>
        </GlassCard>

        {/* Section 10: Third-Party Services */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">10.</span> Third-Party Services
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Platform infrastructure utilizes vetted cloud providers (MongoDB Atlas, Vercel edge networks). Third-party integrations are governed by strict contractual boundaries ensuring no unauthorized access or cross-institution telemetry aggregation.
          </p>
        </GlassCard>

        {/* Section 11: User Rights */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">11.</span> User Rights
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Users retain the right to inspect their recorded institutional profile, request corrections to inaccurate personal records, and configure client cookie preferences. Requests regarding official academic transcripts must be routed through the university registrar.
          </p>
        </GlassCard>

        {/* Section 12: Children's & Student Data Considerations */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">12.</span> Student Data Considerations
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Student privacy is treated with the highest security clearance. The platform is designed to align with institutional educational privacy standards. Behavioral student profiling for commercial exploitation is strictly prohibited.
          </p>
        </GlassCard>

        {/* Section 13: Changes to This Policy */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">13.</span> Changes to This Policy
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            When modifications are made to this specification or operational governance protocols, the revision timestamp at the top of this document will be updated. Meaningful policy adjustments will be broadcast through official platform announcements.
          </p>
        </GlassCard>

        {/* Section 14: Contact Information */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">14.</span> Contact Information
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            For inquiries concerning data privacy architecture or protocol compliance:
          </p>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 font-mono text-xs text-slate-300">
            <div>Institutional Privacy Office: [Institutional privacy contact to be provided]</div>
            <div>Technical Governance Lead: [Technical governance contact to be provided]</div>
            <div>Address: [Campus administration headquarters to be provided]</div>
          </div>
        </GlassCard>

      </div>

      {/* Bottom Action Footer */}
      <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => onSelectTab('terms')}
          className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          View Terms of Service →
        </button>
        <button
          onClick={() => onSelectTab('cookie-preferences')}
          className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          Manage Cookie Preferences →
        </button>
      </div>

    </div>
  );
};
