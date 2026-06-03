import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';
import { IndustryData, OperatingStrategy } from '../types';

interface OnboardingScreenProps {
  industry: IndustryData;
  strategy: OperatingStrategy;
  userEmail: string;
  onComplete: () => void;
}

export default function OnboardingScreen({ industry, strategy, userEmail, onComplete }: OnboardingScreenProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    { text: '初始化后台主结构...', delay: 600 },
    { text: '验证所有者身份...', delay: 800 },
    { text: `载入 ${industry.name} 行业模型...`, delay: 1000 },
    ...industry.team.map((member) => ({
      text: `激活:【${member.role}】成员...`,
      delay: 500
    })),
    { text: `配准策略：【${strategy.name}】`, delay: 700 },
    { text: '同步业务与对账通道...', delay: 800 },
    { text: '构建管理控制面板...', delay: 1000 },
    { text: '🚀 部署完毕，正式启动！', delay: 400 }
  ];

  useEffect(() => {
    let active = true;
    let index = 0;

    const runLogs = () => {
      if (index < steps.length && active) {
        setLogs((prev) => [...prev, steps[index].text]);
        setCurrentStep(index);
        setProgress(((index + 1) / steps.length) * 100);

        setTimeout(() => {
          index++;
          runLogs();
        }, steps[index].delay);
      } else if (active) {
        setProgress(100);
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    };

    runLogs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 font-sans selection:bg-[#1D9BF0] selection:text-white">
      {/* Decorative clean background mesh line */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 bg-black border border-[#2F3336] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(31,111,84,0.05)]">
        {/* Top Header representing server controller */}
        <div className="px-6 py-4 bg-[#09090B] border-b border-[#2F3336] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-neutral-900 border border-[#2F3336] rounded-md">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-mono tracking-wider text-[#8B949E] uppercase">ENTERPRISE CONTROLLER</div>
              <div className="text-sm font-semibold flex items-center space-x-2">
                <span>准备中</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 font-mono text-[10px] text-[#8B949E] bg-neutral-900 px-3 py-1.5 rounded border border-[#2F3336]">
            <span>ACTIVE</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main big graphic representation */}
          <div className="flex items-center justify-between p-4 bg-neutral-950 border border-[#2F3336] rounded-lg">
            <div className="space-y-1">
              <p className="text-xs font-mono text-[#8B949E]">配置企业</p>
              <h2 className="text-lg font-bold flex items-center space-x-2">
                <span className="text-2xl">{industry.emoji}</span>
                <span className="text-white font-display">【{industry.name}】</span>
              </h2>
            </div>
            <div className="w-px h-10 bg-[#2F3336]" />
            <div className="space-y-1 text-right">
              <p className="text-xs font-mono text-[#8B949E]">当前策略</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1D9BF0]/10 text-[#38BDF8] border border-[#1D9BF0]/20 font-mono">
                {strategy.name.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Progress gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-[#8B949E]">
              <span>加载进度</span>
              <span className="text-[#1D9BF0] font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden border border-[#2F3336]/30">
              <motion.div 
                className="h-full bg-[#1D9BF0]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Log terminal */}
          <div className="bg-[#050505] border border-[#2F3336] rounded-lg p-4 h-72 overflow-y-auto font-mono text-xs text-[#8B949E] space-y-2.5 relative">
            <div className="sticky top-0 bg-gradient-to-b from-[#050505] to-transparent h-4 w-full pointer-events-none -mx-4 -mt-4 mb-2" />
            
            <div className="flex items-center space-x-2 text-white/50 pb-2 border-b border-[#2F3336]/30">
              <Terminal className="w-3.5 h-3.5" />
              <span>LOG STREAM</span>
            </div>

            <AnimatePresence initial={false}>
              {logs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`leading-relaxed ${
                    idx === currentStep ? 'text-white font-medium' : 'text-[#8B949E]'
                  } ${log.startsWith('🚀') ? 'text-[#38BDF8]' : ''} ${log.includes('🔔') ? 'text-neutral-200' : ''}`}
                >
                  <span className="text-white/20 mr-2">[{new Date().toLocaleTimeString('zh-CN', { hour12: false })}]</span>
                  <span>{log}</span>
                  {idx === currentStep && idx < steps.length - 1 && (
                    <span className="inline-block w-1.5 h-3 bg-[#1D9BF0] ml-1 animate-pulse" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#09090B] border-t border-[#2F3336] flex items-center justify-between text-xs text-[#8B949E] font-mono">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-[#1D9BF0]" />
            <span>SECURE SYSTEM CONNECTION ACCREDITED</span>
          </div>
          <div>Service Active</div>
        </div>
      </div>
    </div>
  );
}
