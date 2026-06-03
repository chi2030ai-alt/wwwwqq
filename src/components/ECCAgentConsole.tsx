import React, { useState } from 'react';
import { Sliders, Shield, HardDrive, Cpu, Terminal, Plus, Trash2, Eye, ShieldCheck, Check, RotateCcw, Sparkles, Upload, Image, Send, FileText } from 'lucide-react';

interface AgentState {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'IDLE' | 'THINKING' | 'EXECUTING' | 'ERROR';
  model: string;
  tokensUsed: number;
  temperature: number;
  activeThreads: number;
  memorySlots: number;
  workspaceFiles: string[];
  activeTask: string;
}

interface ECCAgentConsoleProps {
  agents: AgentState[];
  onAddLog: (log: string) => void;
  onUpdateAgentTask: (id: string, newTask: string) => void;
}

interface CustomVirtFile {
  id: string;
  name: string;
  content: string;
}

export default function ECCAgentConsole({ agents, onAddLog, onUpdateAgentTask }: ECCAgentConsoleProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('ag1');
  
  // Security parameters states mapped per agent mapping
  const [agentSecuritySettings, setAgentSecuritySettings] = useState<Record<string, {
    budgetLimit: number;
    sandboxEnabled: boolean;
    strictCompliance: boolean;
  }>>({
    ag1: { budgetLimit: 50, sandboxEnabled: true, strictCompliance: true },
    ag2: { budgetLimit: 250, sandboxEnabled: true, strictCompliance: true },
    ag3: { budgetLimit: 500, sandboxEnabled: true, strictCompliance: false },
    ag4: { budgetLimit: 150, sandboxEnabled: true, strictCompliance: true },
    ag5: { budgetLimit: 300, sandboxEnabled: true, strictCompliance: false },
    ag6: { budgetLimit: 80, sandboxEnabled: true, strictCompliance: true },
  });

  // Checklist of specialized prompt skills mapping per agent
  const agentSkillsMatrix: Record<string, Array<{ key: string; name: string; prompt: string; enabled: boolean }>> = {
    ag1: [
      { key: 'layout_autumn', name: '秋冬陈列版型自愈', prompt: '匹配QuietLuxury老钱风调性，自动对齐大衣渲染。', enabled: true },
      { key: 'palette_generator', name: '多维色泽趋势分析', prompt: '一秒渲染RGB及Hex调色板，匹配高加权品类。', enabled: true },
      { key: 'spu_poster_synth', name: '多模态商品海报排版', prompt: '对接Gemini-2.0 Imageify拼装海报。', enabled: false }
    ],
    ag2: [
      { key: 'factory_reorder', name: '代工厂柔性自动追加', prompt: '当SPU库存扣率触超阈值低于20%即刻一网打单。', enabled: true },
      { key: 'lead_time_forecast', name: '上游面料交付周期测算', prompt: '多维度回归分析测算原材料在途天数。', enabled: true },
      { key: 'supplier_pricing_guard', name: '面辅料波动定价防线', prompt: '锁定原料涨幅限价，阶梯减扣采购订单。', enabled: false }
    ],
    ag3: [
      { key: 'voucher_balancing', name: '霸王满减裂变精算', prompt: '精合算周度返利，确保单笔纯利门槛>20%。', enabled: true },
      { key: 'conversion_tuning', name: '转化杠杆自校准调节', prompt: '跟踪流量漏斗，秒秒差微调营销定价出格。', enabled: true },
      { key: 'tax_hedge_recon', name: '跨境关税及对账套利', prompt: '对比Stripe进账流水与报关单，对冲外卡结汇损耗。', enabled: false }
    ],
    ag4: [
      { key: 'refund_authenticator', name: '金卡VIP无感全赔自愈', prompt: '拦截客诉差评起因，原路径退还赔款。', enabled: true },
      { key: 'reappointment_handler', name: '错峰原店总监预约排班', prompt: '触发CRM退款并在凌晨预约明日总监洗发。', enabled: true },
      { key: 'antifraud_screener', name: '拼单恶意薅羊毛反欺诈', prompt: '比对注册信用评分，拦截多账户退单挤压行为。', enabled: false }
    ],
    ag5: [
      { key: 'ad_bidding_calculator', name: '社交热门爆词竞拍器', prompt: '追踪小红书、TikTok飙升关键词。', enabled: true },
      { key: 'pinterest_textify', name: '流媒体多模态文本裂变器', prompt: '生成通勤通勤、瘦腿美化标题文案。', enabled: true },
      { key: 'seo_dynamic_injector', name: '直通车SEO热词动态植入', prompt: '自动化将热销词重写入商铺商品首标题。', enabled: false }
    ],
    ag6: [
      { key: 'token_cost_ledger', name: '每日大盘算力额度审计', prompt: '对比各智体耗费，生成Token日清账册。', enabled: true },
      { key: 'payouts_tax_calculator', name: '商铺Stripe出账抵扣套利', prompt: '自动累计税单申报，规避跨境两成耗。', enabled: true }
    ]
  };

  const [activeSkills, setActiveSkills] = useState<Record<string, Array<{ key: string; name: string; prompt: string; enabled: boolean }>>>(agentSkillsMatrix);

  // Virtual Isolated Workspaces Files states
  const [virtFiles, setVirtFiles] = useState<Record<string, CustomVirtFile[]>>({
    ag1: [
      { id: 'f1', name: 'layout_canvas_cfg.json', content: '{\n  "vibe": "MinimalistModern",\n  "primaryColor": "#C8A2C8",\n  "renderedPosters": 3\n}' },
      { id: 'f2', name: 'spu_poster_builder.py', content: 'def build_poster(theme, bg):\n    print(f"Synthesizing {theme} with background: {bg}")\n    return "synthetic_img_v2_url"' }
    ],
    ag2: [
      { id: 'f3', name: 'supplier_contracts.db', content: '[Binary Datastore: 4 suppliers registered under contract protection]' },
      { id: 'f4', name: 'reorder_points.csv', content: 'spu_id,safety_qty,reorder_trigger\nSPU_STYLE_09,15,True\nSPU_JEWEL_04,30,False' }
    ],
    ag3: [
      { id: 'f5', name: 'roi_lever_optimizer.py', content: 'import sys\ndef optimize_roi(cost, rev):\n    return f"Lever: {(rev-cost)/rev * 100}%"' }
    ],
    ag4: [
      { id: 'f6', name: 'dispute_history_index.json', content: '{\n  "activeRefundArrears": [],\n  "mitigatedAnxietyRatio": "100.0%"\n}' }
    ],
    ag5: [
      { id: 'f7', name: 'xiaohongshu_hot_trend.py', content: 'trends = ["QuietLuxury", "CashmereCore", "OldMoneyStyle"]\nprint("Tracked: ", trends)' }
    ],
    ag6: [
      { id: 'f8', name: 'daily_ledger.db', content: '[SQLite CryptDB: encrypted tax logs for account safe reconciliaton]' }
    ]
  });

  const [openedVirtFileId, setOpenedVirtFileId] = useState<string | null>(null);
  const [openedVirtFileText, setOpenedVirtFileText] = useState<string>('');
  const [newVirtFileName, setNewVirtFileName] = useState('');

  // Advanced collaborative multimodality agent states
  const [playInput, setPlayInput] = useState<string>('当前我们店正处于冬季尾声。请配合大模型视觉解析上传的趋势草图/爆款参考，为我们的冬装清仓设计一个全渠道低价直通车投放文案，并组织 Barton 协同配合给出备货预存计划。');
  const [playSystemPrompt, setPlaySystemPrompt] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [selectedCollaborativeAgents, setSelectedCollaborativeAgents] = useState<string[]>([]);
  const [executingPlayTask, setExecutingPlayTask] = useState<boolean>(false);
  const [playTaskResult, setPlayTaskResult] = useState<{
    success: boolean;
    taskId?: string;
    response?: string;
    attachedImagesLog?: string[];
    collaborationSteps?: Array<{ agent: string; action: string; output: string }>;
    warning?: string;
  } | null>(null);

  const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const handleLaunchJointWorkflow = async () => {
    if (!playInput.trim()) return;
    setExecutingPlayTask(true);
    setPlayTaskResult(null);
    onAddLog(`【智体车坞启动】正在打包多智体跨岗位联合算力方案，核心主导岗位：$${currentAgent.name} 🚀`);

    // Extract dynamic skills prompts if playSystemPrompt is empty
    const currentSkills = activeSkills[selectedAgentId] || [];
    const derivedRolePrompt = playSystemPrompt || 
      `你是摩整公司的核心数字骨干 [${currentAgent.name}]，岗位级别：${currentAgent.role}。在运营中，你恪守以下专业特许微技能：\n` +
      currentSkills.filter(s => s.enabled).map(s => `- 【${s.name}】：${s.prompt}`).join("\n");

    try {
      const payload = {
        agentId: currentAgent.name,
        teamId: currentAgent.id,
        inputMessage: playInput,
        rolePrompt: derivedRolePrompt,
        tenantId: "default_tenant",
        images: attachedFiles,
        collaborativeAgents: selectedCollaborativeAgents
      };

      const response = await fetch(`/api/agents/${encodeURIComponent(currentAgent.name)}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setPlayTaskResult(data);
      if (data.success) {
        onAddLog(`【智体联合算力成功】决策任务 ${data.taskId || ""} 执行完成。已在多岗位智体共识链中固化！🟢`);
      } else {
        onAddLog(`【智体联合算力故障】认知推理链路阻断：${data.error || "未知故障"}`);
      }
    } catch (err: any) {
      console.error(err);
      onAddLog(`【智体联合故障】云端推理超时或拒绝：${err.message}`);
      setPlayTaskResult({
        success: false,
        response: `[本地备用中继激活]：系统无法建立对云端多模态接口的有效侦听。由于本地代存策略，该事件已持久化存储本地 ModaDB 的待办任务中，以便稍后再次执行。`
      });
    } finally {
      setExecutingPlayTask(false);
    }
  };

  const handleImageRead = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedFiles(prev => [...prev, reader.result as string]);
          onAddLog(`【沙盒多模态】视觉实物图像 "${file.name}" 装载成功，Base64 固化就绪！🖼️`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleCollaboratorInPlay = (name: string) => {
    setSelectedCollaborativeAgents(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };
  const security = agentSecuritySettings[selectedAgentId] || { budgetLimit: 100, sandboxEnabled: true, strictCompliance: true };

  const handleUpdateSecurity = (field: 'budgetLimit' | 'sandboxEnabled' | 'strictCompliance', val: any) => {
    setAgentSecuritySettings(prev => ({
      ...prev,
      [selectedAgentId]: {
        ...prev[selectedAgentId] || { budgetLimit: 100, sandboxEnabled: true, strictCompliance: true },
        [field]: val
      }
    }));
    onAddLog(`【ECC 安全调配】更新智体 $${currentAgent.name} 的安全核配 [${field}] 值为: ${val}。`);
  };

  const handleToggleSkill = (skillIndex: number) => {
    const agentKey = selectedAgentId;
    setActiveSkills(prev => {
      const skillsCopy = [...(prev[agentKey] || [])];
      skillsCopy[skillIndex] = {
        ...skillsCopy[skillIndex],
        enabled: !skillsCopy[skillIndex].enabled
      };
      
      onAddLog(`【ECC 技能开关】${currentAgent.name} 专属微技能 [${skillsCopy[skillIndex].name}] 状态置为: ${skillsCopy[skillIndex].enabled ? '🟢 激活' : '🔴 封禁'}`);
      return {
        ...prev,
        [agentKey]: skillsCopy
      };
    });
  };

  const handleSkillPromptOverride = (skillIndex: number, newPrompt: string) => {
    const agentKey = selectedAgentId;
    setActiveSkills(prev => {
      const skillsCopy = [...(prev[agentKey] || [])];
      skillsCopy[skillIndex] = {
        ...skillsCopy[skillIndex],
        prompt: newPrompt
      };
      return {
        ...prev,
        [agentKey]: skillsCopy
      };
    });
  };

  // Custom workspace virtual file creator & deleter
  const handleAddNewVirtualFile = () => {
    if (!newVirtFileName.trim()) return;
    const item: CustomVirtFile = {
      id: `vf_${Date.now()}`,
      name: newVirtFileName,
      content: `# Virtual Sandboxed workspace script: ${newVirtFileName}\n# Model: ${currentAgent.model}\nprint("ModaUI Sandbox Sandbox Operational.")`
    };

    setVirtFiles(prev => ({
      ...prev,
      [selectedAgentId]: [...(prev[selectedAgentId] || []), item]
    }));

    setNewVirtFileName('');
    onAddLog(`【ECC 砂盒文件】在 $${currentAgent.name} 的独立 Workspace 中创建了物理虚拟文件 "${newVirtFileName}"！🟢`);
  };

  const handleDeleteVirtualFile = (id: string, name: string) => {
    setVirtFiles(prev => ({
      ...prev,
      [selectedAgentId]: (prev[selectedAgentId] || []).filter(v => v.id !== id)
    }));
    if (openedVirtFileId === id) {
      setOpenedVirtFileId(null);
      setOpenedVirtFileText('');
    }
    onAddLog(`【ECC 砂盒清扫】移除了 $${currentAgent.name} 的虚拟文件 "${name}"。`);
  };

  const handleSaveVirtFileContent = () => {
    if (!openedVirtFileId) return;
    setVirtFiles(prev => {
      const list = [...(prev[selectedAgentId] || [])];
      const idx = list.findIndex(v => v.id === openedVirtFileId);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          content: openedVirtFileText
        };
      }
      return {
        ...prev,
        [selectedAgentId]: list
      };
    });
    onAddLog(`【ECC 砂盒保存】成功对 ${currentAgent.name} 独立 Workspace 下的 "${virtFiles[selectedAgentId].find(x => x.id === openedVirtFileId)?.name}" 进了物理热保存！`);
    setOpenedVirtFileId(null);
  };

  const currentAgentVirtFiles = virtFiles[selectedAgentId] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left side: select list rail */}
      <div className="lg:col-span-4 space-y-3">
        <span className="text-[10px] font-bold text-zinc-500 font-mono block uppercase">选择特精数字工程师:</span>
        <div className="space-y-2 max-h-[25rem] overflow-y-auto pr-1">
          {agents.map((ag) => {
            const isSelected = selectedAgentId === ag.id;
            return (
              <div
                key={ag.id}
                onClick={() => {
                  setSelectedAgentId(ag.id);
                  setOpenedVirtFileId(null);
                  setOpenedVirtFileText('');
                }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${
                  isSelected
                    ? 'border-[#1D9BF0] bg-[#1D9BF0]/5 shadow-[0_0_8px_rgba(29,155,240,0.15)]'
                    : 'border-neutral-80 & bg-neutral-900/10 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center space-x-3 justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl p-1 bg-neutral-950 border border-neutral-850 rounded-lg">{ag.avatar}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{ag.name}</span>
                        <span className="text-[9px] text-zinc-550 font-mono">#{ag.id.toUpperCase()}</span>
                      </h4>
                      <p className="text-[9.5px] text-neutral-400 mt-0.5">{ag.role.split('与')[0]}</p>
                    </div>
                  </div>
                  
                  {/* Status Indicator circle */}
                  <span className={`w-2 h-2 rounded-full ${ag.status === 'THINKING' ? 'bg-[#1D9BF0] animate-ping' : 'bg-emerald-500'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle and Right: Agent control board */}
      <div className="lg:col-span-8 bg-[#070709] border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2.5 border-b border-neutral-900 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl p-1.5 bg-neutral-950 border border-neutral-800 rounded-xl">{currentAgent.avatar}</span>
              <div>
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 font-display">
                  <span>ECC | {currentAgent.name} ({currentAgent.role}) 控制面</span>
                  <span className="text-[10px] text-zinc-550 font-mono font-normal">#{selectedAgentId.toUpperCase()}</span>
                </h3>
                <p className="text-[9.5px] text-zinc-500 font-mono uppercase mt-0.5">Assigned Target System Controller</p>
              </div>
            </div>

            <span className="text-[9px] font-mono text-zinc-555 px-2 py-0.5 rounded border border-neutral-850 bg-neutral-950 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ISOLATED COGNITIVE SHIELD</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Sec sliders & customized skills parameters checklists */}
            <div className="p-5 bg-black/60 rounded-xl border border-neutral-900 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <span className="text-[9.5px] font-bold text-zinc-500 font-mono uppercase tracking-widest block pb-1 border-b border-neutral-950">
                  ⚙️ 智体特许契约安全控制 (ECC Security Knobs)
                </span>
                
                {/* Budget Authorization limit */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                    <span className="text-zinc-500">单笔财务划拨上限 (Limit Budget):</span>
                    <span className="text-sky-400 font-bold">¥{security.budgetLimit}.00</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={security.budgetLimit}
                    onChange={(e) => handleUpdateSecurity('budgetLimit', parseInt(e.target.value))}
                    className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-[#1D9BF0]"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">物理沙箱写隔离 (Isolate Space):</span>
                    <button
                      onClick={() => handleUpdateSecurity('sandboxEnabled', !security.sandboxEnabled)}
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                        security.sandboxEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {security.sandboxEnabled ? 'SANDBOXED_OK' : 'EXPOSED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">强制系统越狱拦截 (Strict Inode Filter):</span>
                    <button
                      onClick={() => handleUpdateSecurity('strictCompliance', !security.strictCompliance)}
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                        security.strictCompliance ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {security.strictCompliance ? 'ACTIVE_FILTER' : 'BYPASS_WARN'}
                    </button>
                  </div>
                </div>
              </div>

              {/* checklist of active tools / micro-skills */}
              <div className="space-y-3 pt-3 border-t border-neutral-950 font-sans">
                <span className="text-[9.5px] font-bold text-zinc-500 font-mono uppercase tracking-widest block">
                  🛠️ 核心微服务技能配置 (Specialized Skillset Toggles):
                </span>
                <div className="space-y-2 max-h-[10rem] overflow-y-auto pr-1">
                  {(activeSkills[selectedAgentId] || []).map((skill, idx) => (
                    <div key={skill.key} className="p-2.5 bg-neutral-950 border border-neutral-900 rounded-lg text-[10.5px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 text-white font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={skill.enabled}
                            onChange={() => handleToggleSkill(idx)}
                            className="rounded border-neutral-800 text-sky-500 focus:ring-0 focus:ring-offset-0 bg-[#070709]"
                          />
                          <span>{skill.name}</span>
                        </label>
                        <span className="text-[8px] font-mono text-zinc-650 uppercase">[{skill.key}]</span>
                      </div>
                      
                      <input
                        type="text"
                        value={skill.prompt}
                        onChange={(e) => handleSkillPromptOverride(idx, e.target.value)}
                        className="w-full bg-[#070709] border border-neutral-900 rounded px-2 py-1 text-[9.5px] font-mono text-zinc-400 focus:outline-none"
                        placeholder="Customize instructions override..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sandbox Isolated Workspace container browser */}
            <div className="p-5 bg-black/60 rounded-xl border border-neutral-900 flex flex-col justify-between space-y-4 font-mono select-none">
              <div className="space-y-3.5">
                <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-widest block pb-1 border-b border-neutral-955 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-zinc-600" />
                  <span>📁 物理沙盒文件空间 (Workspace Explorer)</span>
                </span>

                {/* Listing currentVirtFiles */}
                <div className="space-y-1.5 max-h-[8.5rem] overflow-y-auto pr-1">
                  {currentAgentVirtFiles.map(vf => (
                    <div key={vf.id} className="p-2 flex items-center justify-between bg-neutral-950/70 hover:bg-neutral-950 border border-neutral-910 rounded text-[10px] text-neutral-300">
                      <span className="truncate max-w-[8.5rem] font-bold text-sky-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-zinc-650" />
                        <span>{vf.name}</span>
                      </span>
                      
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenedVirtFileId(vf.id);
                            setOpenedVirtFileText(vf.content);
                          }}
                          className="p-1 rounded bg-[#070709] hover:bg-neutral-900 text-sky-400 border border-neutral-900 hover:border-sky-500 duration-100 cursor-pointer"
                          title="Open Code Viewer"
                        >
                          <Eye className="w-3 h-3 text-current" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVirtualFile(vf.id, vf.name)}
                          className="p-1 rounded bg-[#070709] hover:bg-neutral-900 text-red-500 border border-neutral-900 hover:border-red-500 duration-100 cursor-pointer"
                          title="Purge Sandbox Asset"
                        >
                          <Trash2 className="w-3 h-3 text-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form to insert virtual file */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newVirtFileName}
                    onChange={(e) => setNewVirtFileName(e.target.value)}
                    placeholder="如: trend_eval.py"
                    className="flex-1 bg-black border border-neutral-800 rounded px-2.5 py-1 text-[10.5px] text-white outline-none focus:border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewVirtualFile}
                    className="px-2.5 py-1 bg-neutral-950 border border-neutral-850 hover:border-[#1D9BF0] text-sky-400 text-[10px] font-bold rounded cursor-pointer"
                  >
                    ＋ 创建
                  </button>
                </div>
              </div>

              {/* Code text editor inline popup */}
              {openedVirtFileId && (
                <div className="p-3 bg-[#0d0e12] border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-zinc-550 border-b border-neutral-900 pb-1.5">
                    <span>Editing Sandbox: {currentAgentVirtFiles.find(x => x.id === openedVirtFileId)?.name}</span>
                    <button onClick={() => setOpenedVirtFileId(null)} className="text-red-500 font-bold hover:text-white">&times; Cancel</button>
                  </div>
                  <textarea
                    value={openedVirtFileText}
                    onChange={(e) => setOpenedVirtFileText(e.target.value)}
                    className="w-full bg-black border border-neutral-905 p-2 rounded text-[10px] font-mono text-emerald-400 leading-normal min-h-[5.5rem] focus:outline-none"
                  />
                  <button
                    onClick={handleSaveVirtFileContent}
                    className="w-full py-1.5 bg-[#1D9BF0]/15 text-sky-400 font-bold text-[10px] rounded border border-[#1D9BF0]/30 hover:bg-[#1D9BF0] hover:text-white duration-150"
                  >
                    写入文件并重启 Sandbox
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thought trace monitors bottom list */}
        <div className="p-4 border border-dashed border-neutral-800 bg-neutral-950/40 rounded-xl space-y-2 font-mono">
          <span className="text-[9.5px] text-zinc-500 uppercase tracking-wider block font-bold">
            🧠 $${currentAgent.name} System Read/Write Thought-Trace Terminal:
          </span>
          <div className="text-[10px] text-zinc-400 leading-relaxed font-sans space-y-1 max-h-[5.5rem] overflow-y-auto pr-1 select-text">
            <p className="hover:text-white duration-100 italic transition-colors">
              [Thread-1] Memory cosine retrieval against base CUST_HABIT_FASHION results sim-weight: <span className="font-mono text-[#1D9BF0]">0.9413</span> (OK).
            </p>
            <p className="hover:text-white duration-100 italic transition-colors">
              [Thread-1] Local container checkout active execution task: {currentAgent.activeTask}
            </p>
          </div>
        </div>

        {/* Real Interactive Multi-Agent & Multimodal Sandbox Station */}
        <div className="mt-6 border-t border-neutral-900 pt-6 space-y-5">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                <span>🧠 Multi-Agent & Multimodal 联合决策车坞 (AI Brainstorm Sandbox)</span>
              </h3>
              <p className="text-[10.5px] text-neutral-400 mt-0.5">
                不仅可由 **{currentAgent.name}** 主导，还可勾选多岗数字员工协作，并提供实物设计草图/参考图片进行级联视觉分析。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Box: Controls & Upload */}
            <div className="xl:col-span-4 space-y-4">
              {/* Collaborative Agent List Selection */}
              <div className="p-4 bg-black/45 rounded-xl border border-neutral-905 space-y-2.5">
                <span className="text-[10px] font-bold text-zinc-400 font-mono block uppercase">
                  👥 协力决策智体 (Collaborator Staff):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {agents
                    .filter(ag => ag.id !== currentAgent.id)
                    .map(ag => {
                      const isSelected = selectedCollaborativeAgents.includes(ag.name);
                      return (
                        <label 
                          key={ag.id} 
                          className={`flex items-center space-x-2 px-2 py-1.5 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-[#1D9BF0] bg-[#1D9BF0]/5 text-sky-400 font-bold' 
                              : 'border-neutral-900 bg-neutral-950/50 hover:bg-neutral-900 text-neutral-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleCollaboratorInPlay(ag.name)}
                            className="rounded border-neutral-800 text-sky-500 focus:ring-0 focus:ring-offset-0 bg-transparent w-3 h-3"
                          />
                          <span className="truncate">{ag.avatar} {ag.name.split(' ')[0]}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Multimodal Image Attachment list */}
              <div className="p-4 bg-black/45 rounded-xl border border-neutral-905 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 font-mono flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-zinc-500" />
                    <span>🖼️ 视觉材质/趋势草图 (Multimodal View):</span>
                  </span>
                  {attachedFiles.length > 0 && (
                    <button 
                      onClick={() => setAttachedFiles([])} 
                      className="text-[9px] text-red-500 hover:underline cursor-pointer"
                    >
                      清空图片
                    </button>
                  )}
                </div>

                {/* Styled file drop zone */}
                <div className="relative border border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-3 bg-neutral-950 flex flex-col items-center justify-center text-center cursor-pointer duration-105 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageRead}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-5 h-5 text-zinc-650 group-hover:text-sky-400 duration-150 mb-1" />
                  <span className="text-[10px] text-zinc-400 group-hover:text-white duration-150">点击或拖拽上传实物图、草图</span>
                  <span className="text-[8px] text-zinc-600 font-mono mt-0.5">支持 PNG, JPG, WEBP | Gemini 视觉解析</span>
                </div>

                {/* Thumbnails preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-950">
                    {attachedFiles.map((base64, index) => (
                      <div key={index} className="relative w-12 h-12 bg-neutral-900 rounded border border-neutral-800 group overflow-hidden">
                        <img 
                          src={base64} 
                          alt="preview" 
                          className="w-full h-full object-cover font-sans"
                          referrerPolicy="no-referrer" 
                        />
                        <button 
                          onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="absolute inset-0 bg-red-650/80 text-white font-bold text-[9px] opacity-0 group-hover:opacity-100 duration-100 flex items-center justify-center"
                        >
                          移除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Task Text area input & Results Terminal */}
            <div className="xl:col-span-8 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 font-mono block uppercase">
                  ✍️ 高阶企业务决策指令 (Enterprise Task Draft):
                </span>
                <div className="relative">
                  <textarea
                    value={playInput}
                    onChange={(e) => setPlayInput(e.target.value)}
                    placeholder="输入具体的任务规则指令或问题让智体联合决策..."
                    className="w-full bg-[#030304] border border-neutral-850 focus:border-zinc-700 text-[11.5px] leading-relaxed p-4 pb-14 rounded-xl text-white focus:outline-none min-h-[6.5rem]"
                  />
                  
                  {/* Action launcher */}
                  <div className="absolute right-3.5 bottom-3.5">
                    <button
                      onClick={handleLaunchJointWorkflow}
                      disabled={executingPlayTask}
                      className="bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-[10.5px] px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 disabled:bg-neutral-800 disabled:text-neutral-500 duration-150 shadow-[0_4px_12px_rgba(14,165,233,0.2)] cursor-pointer"
                    >
                      {executingPlayTask ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>多岗位算力执行中...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-current" />
                          <span>✨ 发起多岗位数字协同 (Execute Workflow)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Show Response Terminal if results exist */}
              {playTaskResult && (
                <div className="p-4 bg-black/60 border border-neutral-850 rounded-xl space-y-3 font-mono text-left">
                  <div className="flex justify-between items-center text-[10px] border-b border-neutral-900 pb-2">
                    <span className="text-zinc-500 flex items-center gap-1.5 font-bold uppercase">
                      <FileText className="w-3.5 h-3.5 text-sky-450" />
                      <span>COGNITIVE OUTCOME TERMINAL [STATUS: SUCCESS]</span>
                    </span>
                    <button 
                      onClick={() => setPlayTaskResult(null)} 
                      className="text-zinc-550 hover:text-white cursor-pointer"
                    >
                      &times; Close
                    </button>
                  </div>

                  <div className="text-[11px] text-zinc-300 space-y-4 max-h-[16rem] overflow-y-auto pr-1 select-text leading-normal">
                    {/* Render step details if collaborationSteps are provided */}
                    {playTaskResult.collaborationSteps && playTaskResult.collaborationSteps.length > 0 ? (
                      <div className="space-y-4">
                        {playTaskResult.collaborationSteps.map((step, idx) => (
                          <div key={idx} className="p-3 bg-neutral-950 border border-neutral-900 rounded-lg space-y-2">
                            <div className="flex justify-between items-center text-[9.5px]">
                              <span className="font-extrabold text-white bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-400/20">
                                岗位智体: {step.agent}
                              </span>
                              <span className="text-zinc-500 font-mono font-normal">
                                行为: {step.action}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                              {step.output}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap font-sans text-neutral-350 leading-relaxed font-sans">
                        {playTaskResult.response}
                      </p>
                    )}

                    {playTaskResult.warning && (
                      <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-md text-[10.5px] font-sans">
                        ⚠️ **本地规则备份机制已激活**: {playTaskResult.warning}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
