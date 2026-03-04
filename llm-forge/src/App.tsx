/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Upload, 
  Settings, 
  MessageSquare, 
  Database, 
  Cpu, 
  Loader2, 
  ChevronRight,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const MODELS = [
  { id: 'tiny', name: 'TinyLlama', description: 'Fast & Lightweight' },
  { id: 'phi', name: 'Phi-3 Mini', description: 'Microsoft Optimized' },
  { id: 'qwen', name: 'Qwen 2.5 3B', description: 'Alibaba Research' },
  { id: 'mistral', name: 'Mistral 7B', description: 'High Performance' },
  { id: 'gemma', name: 'Gemma 2B', description: 'Google Open Model' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [useRag, setUseRag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sanitize and validate API_URL
  const getValidUrl = () => {
    const raw = import.meta.env.VITE_API_URL;
    if (!raw || !raw.startsWith('http')) {
      return "http://localhost:8000"; // Default fallback
    }
    return raw.replace(/\/$/, "");
  };

  const API_URL = getValidUrl();

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        setIsBackendOnline(res.ok);
      } catch (e) {
        console.warn("Health check failed:", e);
        setIsBackendOnline(false);
      }
    };
    checkHealth();
  }, [API_URL]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: selectedModel,
          message: input,
          use_rag: useRag
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Server Error (${response.status}): ${errorData.detail || response.statusText || 'Unknown Error'}`);
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `### ⚠️ Connection Error\n\n**Details:** ${error.message}\n\n**Troubleshooting:**\n1. Ensure your FastAPI server is running at \`${API_URL}\`\n2. Check your terminal for backend logs/errors.\n3. If you are using the HTTPS preview, your browser may be blocking the connection to an HTTP backend (Mixed Content).`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-[#0f0f12] flex flex-col shrink-0">
        <div className="p-6 border-bottom border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">LLM Forge</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          {/* Model Selection */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <Settings className="w-3 h-3" />
              <span>Model Configuration</span>
            </div>
            <div className="space-y-1">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    selectedModel === model.id 
                      ? "bg-blue-600/10 border border-blue-500/20 text-blue-400" 
                      : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="font-medium text-sm">{model.name}</div>
                  <div className="text-[10px] opacity-60 group-hover:opacity-100 transition-opacity">
                    {model.description}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* RAG Controls */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <Database className="w-3 h-3" />
              <span>Knowledge Base (RAG)</span>
            </div>
            
            <div className="px-2 space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Enable RAG Engine</span>
                <div 
                  onClick={() => setUseRag(!useRag)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    useRag ? "bg-blue-600" : "bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                    useRag ? "left-6" : "left-1"
                  )} />
                </div>
              </label>

              <div className="space-y-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden" 
                  accept=".txt,.pdf,.md"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-sm transition-all",
                    uploadStatus === 'success' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" :
                    uploadStatus === 'error' ? "bg-red-500/10 border-red-500/50 text-red-400" :
                    "bg-white/5 border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : uploadStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : uploadStatus === 'error' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isUploading ? 'Indexing...' : uploadStatus === 'success' ? 'Indexed!' : 'Upload Document'}</span>
                </button>
                <p className="text-[10px] text-slate-500 text-center px-2">
                  Supports .txt files for indexing into the RAG engine.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-2">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isBackendOnline === true ? "bg-emerald-500" : 
              isBackendOnline === false ? "bg-red-500" : "bg-amber-500"
            )} />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
              {isBackendOnline === true ? 'Backend Online' : 
               isBackendOnline === false ? 'Backend Offline' : 'Checking Connection...'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[#0a0a0c] relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 blur-[120px] rounded-full" />
        </div>

        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0c]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-blue-500">MODEL_ID:</span>
              <span className="text-xs font-mono text-slate-300 uppercase">{selectedModel}</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-blue-500">RAG_STATUS:</span>
              <span className={cn(
                "text-xs font-mono uppercase",
                useRag ? "text-emerald-500" : "text-slate-500"
              )}>{useRag ? 'Active' : 'Disabled'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 pt-8 pb-1 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl shadow-blue-500/10"
              >
                <Cpu className="w-8 h-8 text-blue-500" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">System Ready</h2>
                <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                  Select a model and start your session. Enable RAG to augment responses with your local knowledge base.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                {['Explain quantum computing', 'Write a Python script', 'Summarize a document', 'Creative writing prompt'].map((hint) => (
                  <button 
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="p-3 text-[11px] text-left text-slate-400 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all group flex items-center justify-between font-mono uppercase tracking-wider"
                  >
                    <span>{hint}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 max-w-4xl mx-auto",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300",
                    msg.role === 'user' 
                      ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20" 
                      : "bg-[#15151a] border-white/10"
                  )}>
                    {msg.role === 'user' ? (
                      <span className="text-xs font-bold text-white">U</span>
                    ) : (
                      <Cpu className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className={cn(
                    "space-y-1.5 max-w-[85%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-blue-600/10 border border-blue-500/20 text-blue-50" 
                        : "bg-[#15151a] border border-white/10 text-slate-200"
                    )}>
                      {msg.role === 'bot' ? (
                        <div className="prose prose-invert prose-sm max-w-none font-mono selection:bg-blue-500/40">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    <div className={cn(
                      "px-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest",
                      msg.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-lg bg-[#15151a] border border-white/10 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-blue-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#15151a] border border-white/10">
                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em]">Synthesizing...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} className="h-2" />
        </div>

        {/* Input Area - Absolute bottom placement */}
        <div className="px-8 pb-2 pt-0 z-10 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent">
          <div className="max-w-4xl mx-auto relative group flex flex-col">
            <div className="mb-2 flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-600 tracking-tighter">
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span>LN 1, COL {input.length + 1}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-1">
                  <span className="text-blue-500/50">MOD:</span>
                  <span>{MODELS.find(m => m.id === selectedModel)?.name}</span>
                </div>
                <div className="w-px h-2 bg-white/5" />
                <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-1">
                  <span className="text-blue-500/50">RAG:</span>
                  <span className={useRag ? "text-emerald-500/70" : ""}>{useRag ? 'ACTIVE' : 'OFF'}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-700" />
              <div className="relative bg-[#111116] border border-white/10 rounded-2xl p-2 flex items-end gap-2 shadow-2xl ring-1 ring-white/5">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Command input..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] text-slate-200 placeholder:text-slate-600 resize-none max-h-48 min-h-[44px] py-3 px-4 font-mono"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-3 rounded-xl transition-all duration-300 shrink-0",
                    input.trim() && !isLoading
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95"
                      : "bg-white/5 text-slate-700 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
