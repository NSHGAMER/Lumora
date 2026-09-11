import React from 'react';
import { Scale, ArrowLeft, FileCheck, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface TermsOfServiceViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const TermsOfServiceView: React.FC<TermsOfServiceViewProps> = ({ onSelectTab }) => {
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
          <Badge variant="blue" pulse>
            <Scale className="w-3 h-3" />
            <span>Terms of Service Protocol</span>
          </Badge>
          <span className="text-xs font-mono text-slate-500">
            Last Revised: September 2026
          </span>
        </div>
      </div>

      {/* Hero Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Institutional Operating Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-slate-400 font-sans text-sm sm:text-base max-w-3xl leading-relaxed">
          These Terms of Service govern the authorized usage, operational rights, and mutual responsibilities for all students, faculty, and administrative personnel accessing the Lumora Campus Operating System.
        </p>

        {/* Prototype Disclaimer Notice */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs font-mono text-amber-300/90">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-200">Prototype Specification Notice:</strong> This document reflects the technical terms and operational scope for the Lumora Campus OS prototype. Formal institutional agreements and binding university bylaws will be supplied by university counsel upon production deployment.
          </p>
        </div>
      </div>

      {/* Document Sections */}
      <div className="space-y-8 font-sans text-sm sm:text-base text-slate-300">
        
        {/* Section 1: Acceptance of Terms */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">01.</span> Acceptance of Terms
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            By authenticating into, browsing, or interacting with Lumora, you agree to abide by these Terms of Service, applicable campus codes of conduct, and university technological policies. If you do not accept these terms, you must discontinue platform use immediately.
          </p>
        </GlassCard>

        {/* Section 2: Platform Purpose */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">02.</span> Platform Purpose
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Lumora is designed to unify academic management, physical campus facility monitoring, role-specific command consoles, and AI-assisted workflow coordination. It serves as an institutional operating system rather than a public social utility.
          </p>
        </GlassCard>

        {/* Section 3: User Accounts */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">03.</span> User Accounts
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Accounts are provisioned based on verified institutional roles (Student, Faculty, Administrator, Staff). Users are solely responsible for maintaining the confidentiality of their session credentials and are strictly prohibited from sharing account access or impersonating other institutional members.
          </p>
        </GlassCard>

        {/* Section 4: Acceptable Use */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">04.</span> Acceptable Use
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Users agree not to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-300 font-mono pl-2">
            <li>Attempt to bypass Role-Based Access Controls (RBAC) or access unauthorized administrative records.</li>
            <li>Conduct automated scraping, rate-limit exploitation, or denial-of-service tests against campus APIs.</li>
            <li>Inject malicious payloads, SQL commands, or script exploits through search palettes or form inputs.</li>
            <li>Use the platform or JSR assistant to generate abusive, deceptive, or academically fraudulent content.</li>
          </ul>
        </GlassCard>

        {/* Section 5: Academic and Institutional Information */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">05.</span> Academic and Institutional Information
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Course schedules, room allocations, credits, and GPA workload scores rendered within Lumora represent synchronized institutional records. In the event of an unresolved timing dispute, official registrar archives remain the binding authoritative record.
          </p>
        </GlassCard>

        {/* Section 6: AI Services and JSR */}
        <GlassCard interactive={false} glowColor="cyan" className="space-y-3 border-cyan-500/20">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">06.</span> AI Services & JSR The Intelligence
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            <strong>JSR — The Intelligence</strong> functions as an AI orchestration assistant. Important advisory parameters apply:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-cyan-300/90 font-mono pl-2">
            <li><strong>Verification Requirement:</strong> AI-generated advisory recommendations (e.g., graduation credit audits, prerequisite checks) are assistive and may require verification with academic advisors where appropriate.</li>
            <li><strong>Capability Boundaries:</strong> JSR executes actions only where underlying backend tools and endpoints are implemented and authenticated. JSR does not claim capabilities that are not technically active.</li>
            <li><strong>Data Integrity:</strong> JSR will never present fabricated institutional records as factual data.</li>
          </ul>
        </GlassCard>

        {/* Section 7: Automated Actions */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">07.</span> Automated Actions
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Actions executed through workflow automation engines (such as n8n triggers or automated alert broadcasts) are subject to role permission auditing. Users initiating automated batch requests must verify action parameters before submission.
          </p>
        </GlassCard>

        {/* Section 8: Communication Services */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">08.</span> Communication Services
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Campus announcements, alert banners, and support tickets must adhere to civil communication standards. Mass broadcast capabilities are restricted exclusively to authorized administrative roles.
          </p>
        </GlassCard>

        {/* Section 9: Third-Party Services */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">09.</span> Third-Party Services
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Third-party hosting, database clusters, and external library integrations are subject to their respective service level standards. Lumora maintains technical safeguards to isolate institution data from third-party exposure.
          </p>
        </GlassCard>

        {/* Section 10: Availability */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">10.</span> Availability & Maintenance
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            While Lumora targets high availability (99.9% uptime), occasional maintenance windows, infrastructure updates, or emergency hardware patches will occur. Scheduled downtime will be posted to the Maintenance Mode status console whenever practical.
          </p>
        </GlassCard>

        {/* Section 11: User Responsibilities */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">11.</span> User Responsibilities
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Users must verify that personal profile information and institutional IDs remain current. Any discovery of security vulnerabilities, unauthorized access attempts, or software bugs must be responsibly reported to institutional systems administrators.
          </p>
        </GlassCard>

        {/* Section 12: Limitation of Liability */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">12.</span> Limitation of Liability
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            To the maximum extent permitted by applicable law, Lumora and its developers shall not be liable for indirect, incidental, or consequential damages resulting from unexpected server downtime, network interruptions, or decisions made based on unverified assistive AI outputs.
          </p>
        </GlassCard>

        {/* Section 13: Changes to Terms */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">13.</span> Changes to Terms
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Institutional management reserves the right to revise these terms as legal, security, and academic standards evolve. Continued interaction with Lumora following posted revisions constitutes acceptance of the modified terms.
          </p>
        </GlassCard>

        {/* Section 14: Contact Information */}
        <GlassCard interactive={false} glowColor="none" className="space-y-3">
          <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-sm">14.</span> Contact Information
          </h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            For governance or compliance inquiries concerning these terms:
          </p>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 font-mono text-xs text-slate-300">
            <div>Office of Academic Affairs: [Institutional legal contact to be provided]</div>
            <div>Campus OS Governance: [Institutional operations contact to be provided]</div>
            <div>Security Desk: [Institutional security contact to be provided]</div>
          </div>
        </GlassCard>

      </div>

      {/* Bottom Action Footer */}
      <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => onSelectTab('privacy')}
          className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          View Privacy Policy →
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
