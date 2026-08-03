import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, User, Code, ChevronRight, RefreshCw, Volume2 } from 'lucide-react';
import type { JSRMessage } from '../../types';

interface JSRAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const JSRAssistantModal: React.FC<JSRAssistantModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [input, setInput] = useState(initialQuery);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<JSRMessage[]>([
    {
      id: 'msg-1',
      sender: 'jsr',
      text: "Greetings. I am JSR, your Lumora Campus Co-Pilot. How can I assist your academic workflow, lab research, or schedule optimization today?",
      timestamp: 'Just now',
      category: 'general',
      actionButtons: [
        { label: 'Optimize Schedule', action: 'Optimize my weekly schedule for optimal focus blocks' },
        { label: 'Review Code', action: 'Analyze my Python data science script for memory leaks' },
        { label: 'Lab Booking', action: 'Find available GPU workstations in Turing Hall' },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSendQuery(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: JSRMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate intelligent JSR streaming response
    setTimeout(() => {
      let responseText = "";
      let codeSnippet: string | undefined = undefined;

      const lower = queryText.toLowerCase();
      if (lower.includes('schedule') || lower.includes('course') || lower.includes('timetable')) {
        responseText = "I've analyzed your enrolled courses for Fall 2026. You have a 3-hour gap between Quantum Computing II and Advanced Machine Learning on Wednesdays. I recommend booking Focus Room 4B during this block.";
      } else if (lower.includes('gpu') || lower.includes('lab') || lower.includes('turing') || lower.includes('workstation')) {
        responseText = "Current GPU Cluster telemetry in Turing Science Center:\n• Cluster Alpha (A100 x 8): 94% utilized\n• Cluster Beta (H100 x 4): 2 Stations Available (Node B-12, Node B-14)\nI can reserve Node B-12 for 2 hours immediately.";
      } else if (lower.includes('code') || lower.includes('python') || lower.includes('debug')) {
        responseText = "Here is an optimized vectorization snippet for your matrix multiplication routine using PyTorch GPU tensors:";
        codeSnippet = `import torch

# Lumora High-Performance Tensor Matrix Dispatch
def run_quantum_sim(tensor_a, tensor_b):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    return torch.matmul(tensor_a.to(device), tensor_b.to(device))`;
      } else {
        responseText = `I have dispatched query "${queryText}" across the Lumora Academic Knowledge Graph. All system metrics remain optimal. Would you like me to schedule a task or notify your research team?`;
      }

      const jsrMsg: JSRMessage = {
        id: `jsr-${Date.now()}`,
        sender: 'jsr',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeSnippet,
      };

      setMessages((prev) => [...prev, jsrMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#05070B]/85 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-3xl h-[640px] bg-[#0A1019] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 shadow-accent-cyan">
                  <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base text-white tracking-wide">JSR AI ASSISTANT</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Neural Engine v4
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Lumora Campus Co-Pilot • Intelligent & Minimal</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>Voice Synth Ready</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'jsr' && (
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line font-sans">{msg.text}</p>

                    {msg.codeSnippet && (
                      <div className="mt-3 rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs overflow-x-auto">
                        <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800 text-[11px]">
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <Code className="w-3.5 h-3.5" /> Python
                          </span>
                          <span>JSR Code Generator</span>
                        </div>
                        <pre className="text-emerald-300">{msg.codeSnippet}</pre>
                      </div>
                    )}

                    {msg.actionButtons && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.actionButtons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendQuery(btn.action)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all cursor-pointer"
                          >
                            <span>{btn.label}</span>
                            <ChevronRight className="w-3 h-3 text-cyan-400" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[10px] font-mono mt-2 ${
                        msg.sender === 'user' ? 'text-cyan-100/70 text-right' : 'text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Bot className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/10 text-slate-400 text-xs font-mono flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>JSR is synthesizing response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-white/10 bg-slate-950/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask JSR about courses, research labs, code debugging, or campus telemetry..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm font-sans"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-accent-cyan cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
