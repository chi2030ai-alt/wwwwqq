import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, CreditCard, History, Cpu, Key, RefreshCw, Layers, Activity, BookOpen, ChevronDown, Check,
  Search, X, ShieldAlert, BadgeHelp, Globe, Mail, Users, Truck, MessageSquare, ToggleLeft, ToggleRight, 
  Settings, Save, Landmark, ShoppingBag, Database, Radio, Bell, HelpCircle, HardDrive, Smartphone, Sparkles, AlertCircle
} from 'lucide-react';
import { IndustryData, OperatingStrategy } from '../types';

interface MerchantSettingsSubViewProps {
  // Existing profile states
  editBrandName: string;
  setEditBrandName: (v: string) => void;
  editSlogan: string;
  setEditSlogan: (v: string) => void;
  
  // Billing states
  merchantStatus: 'active' | 'suspended' | 'trial_expired';
  merchantBillingTier: 'trial' | 'professional' | 'enterprise';
  setMerchantBillingTier: (v: 'trial' | 'professional' | 'enterprise') => void;
  merchantTokenBalance: number;
  merchantSpendAmount: number;
  merchantRechargeTotal: number;
  billingLogs: any[];
  handlePerformSaaSTopup: (type: string, amount: number, tokens: number, item: string) => void;
  handleSaveMerchantProfile: (brand: string, slogan: string) => void;
  
  // Model settings
  apiProvider: 'gemini' | 'deepseek' | 'openai' | 'ollama';
  setApiProvider: (v: 'gemini' | 'deepseek' | 'openai' | 'ollama') => void;
  geminiKey: string;
  setGeminiKey: (v: string) => void;
  deepseekKey: string;
  setDeepseekKey: (v: string) => void;
  openaiKey: string;
  setOpenaiKey: (v: string) => void;
  ollamaEndpoint: string;
  setOllamaEndpoint: (v: string) => void;
  ollamaSearchQuery: string;
  setOllamaSearchQuery: (v: string) => void;
  ollamaModels: string[];
  setOllamaModels: (v: any) => void;
  ollamaModel: string;
  setOllamaModel: (v: string) => void;
  customOllamaModelInput: string;
  setCustomOllamaModelInput: (v: string) => void;
  
  // Diagnostic
  testLog: string;
  setTestLog: (v: string) => void;
  testConnectionStatus: 'idle' | 'testing' | 'success' | 'failed';
  setTestConnectionStatus: (v: 'idle' | 'testing' | 'success' | 'failed') => void;
  
  // Backup / Drive states
  driveAccessToken: string;
  driveUserEmail: string;
  isBackingUp: boolean;
  isRestoring: boolean;
  isSearchingBackups: boolean;
  driveBackups: any[];
  selectedBackupId: string;
  setSelectedBackupId: (v: string) => void;
  handleConnectDrive: () => void;
  handleDisconnectDrive: () => void;
  handleBackupToDrive: () => void;
  handleRestoreFromDrive: () => void;
  handleFetchBackups: () => void;
  
  // Purge / Reset states
  wipeProductsInPurge: boolean;
  setWipeProductsInPurge: (v: boolean) => void;
  handleProductionPurge: (wipe: boolean) => void;
  
  // General configs
  userRole: 'founder' | 'admin' | 'manager' | 'staff' | 'customer';
  industry: IndustryData;
  strategy: OperatingStrategy;
  sales: number;
  productsList: any[];
  storeHeadline: string;
  storeTheme: 'retro' | 'dark' | 'classic';
  setStoreTheme: (v: 'retro' | 'dark' | 'classic') => void;
  disputeResolved: string;
  onAddLog?: (sender: string, emoji: string, message: string, type: 'info' | 'success' | 'warn') => void;
}

export default function MerchantSettingsSubView({
  editBrandName, setEditBrandName,
  editSlogan, setEditSlogan,
  merchantStatus,
  merchantBillingTier, setMerchantBillingTier,
  merchantTokenBalance,
  merchantSpendAmount,
  merchantRechargeTotal,
  billingLogs,
  handlePerformSaaSTopup,
  handleSaveMerchantProfile,
  
  apiProvider, setApiProvider,
  geminiKey, setGeminiKey,
  deepseekKey, setDeepseekKey,
  openaiKey, setOpenaiKey,
  ollamaEndpoint, setOllamaEndpoint,
  ollamaSearchQuery, setOllamaSearchQuery,
  ollamaModels, setOllamaModels,
  ollamaModel, setOllamaModel,
  customOllamaModelInput, setCustomOllamaModelInput,
  
  testLog, setTestLog,
  testConnectionStatus, setTestConnectionStatus,
  
  driveAccessToken,
  driveUserEmail,
  isBackingUp,
  isRestoring,
  isSearchingBackups,
  driveBackups,
  selectedBackupId, setSelectedBackupId,
  handleConnectDrive,
  handleDisconnectDrive,
  handleBackupToDrive,
  handleRestoreFromDrive,
  handleFetchBackups,
  
  wipeProductsInPurge, setWipeProductsInPurge,
  handleProductionPurge,
  
  userRole,
  industry,
  strategy,
  sales,
  productsList,
  storeHeadline,
  storeTheme, setStoreTheme,
  disputeResolved,
  onAddLog
}: MerchantSettingsSubViewProps) {
  
  // Settings tab selections
  type SettingsTab = 
    | 'general' | 'billing' | 'perms' | 'payments' | 'customers' 
    | 'logistics' | 'marketing_brand' | 'apps' | 'notifications' 
    | 'language' | 'policies' | 'ai_team' | 'knowledge';

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [successToast, setSuccessToast] = useState('');

  // 1. General Settings mock states
  const [shopPhone, setShopPhone] = useState('400-666-8800');
  const [shopStatus, setShopStatus] = useState<'open' | 'maintenance'>('open');
  const [activeIndustryId, setActiveIndustryId] = useState(industry.id);

  // 4. Payment Platform states
  const [paymentStripe, setPaymentStripe] = useState(true);
  const [paymentPaypal, setPaymentPaypal] = useState(false);
  const [paymentWechat, setPaymentWechat] = useState(true);
  const [paymentAlipay, setPaymentAlipay] = useState(true);
  const [paymentMode, setPaymentMode] = useState<'sandbox' | 'live'>('sandbox');

  // 5. Customer Profile states
  const [customerMemberships, setCustomerMemberships] = useState<'disabled' | 'basic' | 'vip' | 'premium'>('vip');
  const [customerAutoTrack, setCustomerAutoTrack] = useState(true);
  const [customerAiProfiling, setCustomerAiProfiling] = useState(true);
  const [customerRecall, setCustomerRecall] = useState<'ai' | 'sms' | 'disabled'>('ai');

  // 6. Logistics configurations
  const [selectedWarehouse, setSelectedWarehouse] = useState<'shanghai' | 'guangzhou' | 'crossborder'>('shanghai');
  const [selectedDispatch, setSelectedDispatch] = useState<'east_china' | 'south_china' | 'default'>('east_china');
  const [logisticsRule, setLogisticsRule] = useState<'sf' | 'local' | 'self'>('sf');

  // 7. Market & Branding Domain states
  const [domainType, setDomainType] = useState<'subdomain' | 'custom' | 'relay'>('subdomain');
  const [subdomainText, setSubdomainText] = useState(`${editBrandName ? editBrandName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'shop'}.modaui.com`);
  const [currentCurrency, setCurrentCurrency] = useState<'CNY' | 'USD' | 'EUR'>('CNY');

  // 8. Apps configuration flags
  const [appAiMarketing, setAppAiMarketing] = useState(true);
  const [appInventoryAlign, setAppInventoryAlign] = useState(true);
  const [appLiveTranslation, setAppLiveTranslation] = useState(false);
  const [appAutoAccounts, setAppAutoAccounts] = useState(true);

  // 9. Notification toggles
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWechat, setNotifyWechat] = useState(false);

  // 10. Language selection
  const [selectedLanguage, setSelectedLanguage] = useState<'zh_CN' | 'en_US' | 'ja_JP'>('zh_CN');

  // 11. Policies status
  const [policyRefund7Days, setPolicyRefund7Days] = useState(true);
  const [policyPrivacy, setPolicyPrivacy] = useState(true);
  const [policyGdprCookie, setPolicyGdprCookie] = useState(false);

  // Apply Industry Preset Defaults when user clicks or defaults
  useEffect(() => {
    // Highly tailored defaults for the selected industry
    if (industry.id === 'clothing') {
      setShopPhone('400-666-8801');
      setStoreTheme('dark');
      setLogisticsRule('sf');
    } else if (industry.id === 'catering') {
      setShopPhone('400-666-8802');
      setStoreTheme('classic');
      setLogisticsRule('local'); // Instant rider
    } else if (industry.id === 'beauty') {
      setShopPhone('400-666-8803');
      setStoreTheme('retro');
      setLogisticsRule('self'); // Take-out or onsite
    } else if (industry.id === 'fitness') {
      setShopPhone('400-666-8804');
      setStoreTheme('dark');
      setLogisticsRule('self');
    } else if (industry.id === 'jewelry') {
      setShopPhone('400-666-8805');
      setStoreTheme('retro');
      setLogisticsRule('sf'); // Highly secured Sf air shipping
    } else if (industry.id === 'furniture') {
      setShopPhone('400-666-8806');
      setStoreTheme('classic');
      setLogisticsRule('sf');
    }
  }, [industry.id]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleApplyPreset = () => {
    if (onAddLog) {
      onAddLog('系统设置', '🔮', `已为您加载所处【${industry.name}】行业的全部 100% 极速经营黄金设置参数！3秒极速上线就绪。`, 'success');
    }
    showToast(`⚡ 行业黄金预设参数加载完毕！[${industry.name}]`);
  };

  // Diagnostic Test callback
  const handleTriggerStatusCheck = async () => {
    setTestConnectionStatus('testing');
    setTestLog('▶ 正在向主通信端点 `/api/status` 长链接安全握手校验中...');
    try {
      const res = await fetch('/api/status');
      const d = await res.json();
      if (d && d.success) {
        setTestConnectionStatus('success');
        setTestLog(`✔ 双向 SSL 验证通过！MODA 引擎运行顺畅。\n模型授权: ${d.hasKey ? '云端在线 (ONLINE)' : '本地仿真 (SANDBOX)'}\n授权用户: ${driveUserEmail || 'MODAUI Owner'}`);
        if (onAddLog) {
          onAddLog('AI网络架构师', '🌐', '系统API网络及密钥中继连接性握手 100% 验证成功！', 'success');
        }
      } else {
        throw new Error("响应包体不合法");
      }
    } catch {
      setTestConnectionStatus('failed');
      setTestLog(`❌ 连接验证拒绝。请核查 API 秘钥或防火墙设置。目前处于离线仿真容灾通道中。`);
    }
  };

  // Save Config triggers
  const handleSaveAllLocalConfig = () => {
    handleSaveMerchantProfile(editBrandName, editSlogan);
    if (onAddLog) {
      onAddLog('系统大盘', '💾', `保存了全新更改，设置状态写入云数据库，通知、物理分发及财务对账节点完美合并。`, 'success');
    }
    showToast('💾 核心设置与策略修改已被持久化同步！');
  };

  const menuItems = [
    { id: 'general', label: '一般设置', emoji: '🏢', desc: '店铺基础配置、营业期控制' },
    { id: 'billing', label: '计划与账单', emoji: '💳', desc: '充值算力包、月租订阅层级' },
    { id: 'perms', label: '用户与权限', emoji: '🔑', desc: '团队职级组织、RBAC 调试' },
    { id: 'payments', label: '付款', emoji: '💳', desc: 'Stripe, 微信, 支付宝及账单对齐' },
    { id: 'customers', label: '客户管理', emoji: '👥', desc: '会员追踪、智能行为与回访' },
    { id: 'logistics', label: '物流设置', emoji: '🚚', desc: '发货中央仓、顺丰出网配送规则' },
    { id: 'marketing_brand', label: '市场与品牌', emoji: '🌐', desc: '独立域名、国家地区、视觉配色' },
    { id: 'apps', label: '应用配置', emoji: '📦', desc: '营销插件、跨端对账应用开关' },
    { id: 'notifications', label: '通知接收', emoji: '🔔', desc: '短信物流通知、邮件聚合对账' },
    { id: 'language', label: '语言', emoji: '🗣️', desc: '系统前端翻译与多言语映射' },
    { id: 'policies', label: '隐私与政策', emoji: '🛡️', desc: '无理由退货、GDPR 与条款生成' },
    { id: 'ai_team', label: 'AI 团队配置', emoji: '🤖', desc: 'Gemini极高速推理模型参数' },
    { id: 'knowledge', label: '行业知识库', emoji: '📚', desc: 'RAG 向量关联库与特征配对' }
  ];

  return (
    <div className="bg-[#09090B] border border-neutral-900 rounded-2xl overflow-hidden min-h-[680px] flex flex-col lg:flex-row relative">
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1D9BF0] text-white px-5 py-3 rounded-lg shadow-2xl flex items-center space-x-2 text-xs font-bold font-mono"
          >
            <Check className="h-4 w-4" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Sidebar Category Selectors */}
      <div className="w-full lg:w-72 bg-neutral-950 border-r border-[#2F3336]/40 p-4 shrink-0 overflow-y-auto space-y-4">
        <div>
          <div className="flex items-center space-x-2 px-2.5 pb-2 border-b border-[#2F3336]/30">
            <Settings className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-bold text-white tracking-widest uppercase font-mono">商号控制设置中心</h2>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1.5 px-2.5">在此配置或一键勾选店铺各种经营决策</p>
        </div>

        {/* 3-Minute Quick Onboard Golden Presets Indicator */}
        <div 
          onClick={handleApplyPreset}
          className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-left cursor-pointer hover:bg-sky-500/15 transition group"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="text-[11px] font-extrabold text-white group-hover:text-sky-300">行业黄金极速极简配置</span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-normal mt-1">
            一键自动根据【{industry.name}】属性，补全90%营销、物流、通知与支付规则，免除表格填写！
          </p>
        </div>

        {/* Menu selections list */}
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition duration-150 flex items-center space-x-3 group ${
                  isActive 
                    ? 'bg-[#1D9BF0]/15 text-white border border-[#1D9BF0]/30 font-bold' 
                    : 'text-zinc-400 hover:text-white hover:bg-neutral-900 border border-transparent'
                }`}
              >
                <span className="text-base shrink-0 select-none">{item.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight tracking-tight">{item.label}</p>
                  <p className="text-[9.5px] text-zinc-500 truncate mt-0.5 group-hover:text-zinc-400 font-sans">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content Pane Details */}
      <div className="flex-1 bg-neutral-950 p-6 overflow-y-auto text-left min-h-[500px]">
        
        {/* Header summary of active option */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#2F3336]/40 pb-5 mb-6 gap-3">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-1.5 font-sans">
              <span>{menuItems.find(m => m.id === activeTab)?.emoji}</span>
              <span>{menuItems.find(m => m.id === activeTab)?.label}</span>
              <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                {activeTab} Settings sharding
              </span>
            </h2>
            <p className="text-[10.5px] text-zinc-500 mt-1">{menuItems.find(m => m.id === activeTab)?.desc}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSaveAllLocalConfig}
              className="px-3.5 py-1.5 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-sky-400" />
              <span>持久保存当前分块</span>
            </button>
          </div>
        </div>

        {/* Dynamic Inner Panel Body */}
        <div className="space-y-6">

          {/* 1. GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              
              {/* Store state toggle card select */}
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">1.1 店铺对外开业状况 (Operational State)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setShopStatus('open')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      shopStatus === 'open' 
                        ? 'border-emerald-500/50 bg-emerald-500/5 text-white' 
                        : 'border-[#2F3336] bg-black text-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-white">🟢 营业开门中 (Online Open)</span>
                      {shopStatus === 'open' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal mt-2">允许外部消费者通过公网独立展示间下单和客服咨询大模型。</p>
                  </div>

                  <div 
                    onClick={() => setShopStatus('maintenance')}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      shopStatus === 'maintenance' 
                        ? 'border-amber-500/50 bg-amber-500/5 text-white' 
                        : 'border-[#2F3336] bg-black text-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-white">🚧 闭门整修中 (Maintenance)</span>
                      {shopStatus === 'maintenance' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal mt-2">顾客访问将显示维护中页面，全员智体处于后台挂起审计训练阶段。</p>
                  </div>
                </div>
              </div>

              {/* Minimal Text Inputs */}
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">1.2 主体核心物料名录</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">店铺公司官方名称</label>
                    <input 
                      type="text" 
                      value={editBrandName}
                      onChange={(e) => setEditBrandName(e.target.value)}
                      className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      placeholder="如：MODA 高定成衣精品店"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">客服对公联系热线</label>
                    <input 
                      type="text" 
                      value={shopPhone}
                      onChange={(e) => setShopPhone(e.target.value)}
                      className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">店铺宣传标语 Slogan</label>
                    <input 
                      type="text" 
                      value={editSlogan}
                      onChange={(e) => setEditSlogan(e.target.value)}
                      className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                      placeholder="输入店铺推广标语"
                    />
                  </div>
                </div>
              </div>

              {/* Tag/Card Select for targeted industry */}
              <div className="bg-neutral-900/30 border border-neutral-900 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase font-mono">1.3 智体适配行业定位 (Industry Target)</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    { id: 'clothing', name: '高定服装 👚', desc: '美学高级成衣、仓配分件' },
                    { id: 'catering', name: '快餐餐饮 🍛', desc: '外卖排菜、即刻调度' },
                    { id: 'beauty', name: '沙龙美业 💄', desc: '预订套餐、会员储值' },
                    { id: 'fitness', name: '运动健身 👟', desc: '健体课表、器械团购' },
                    { id: 'jewelry', name: '奢华高定珠宝 💎', desc: '贵金属保值保价顺丰空运' },
                    { id: 'furniture', name: '家居空间 🏡', desc: '选品配送送装重型物流' }
                  ].map((ind) => (
                    <div
                      key={ind.id}
                      onClick={() => {
                        setActiveIndustryId(ind.id);
                        showToast(`💡 设定经营行业为: ${ind.name}`);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        activeIndustryId === ind.id 
                          ? 'border-sky-500 bg-sky-500/10 text-white font-bold' 
                          : 'border-neutral-900 bg-black text-zinc-500 hover:border-neutral-800'
                      }`}
                    >
                      <p className="text-xs text-white font-black">{ind.name}</p>
                      <p className="text-[10px] text-zinc-400 mt-1 font-sans">{ind.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 2. PLAN & BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              
              {/* Top subscription tier billing selector cards */}
              <div className="bg-neutral-900/20 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">2.1 企业订阅套餐级别 (Enterprise Subscriptions)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'trial', label: '🛡️ 基础试用沙盒', rmb: '免费试用', desc: '赠送 150 万每日重置 Tokens，含单通道独立预览间' },
                    { id: 'professional', label: '👑 全方位专业版', rmb: '￥299 /月租', desc: '包含 500 万 Token/月、双向 Socket 锁仓防护及 4 大 AI 专家席位' },
                    { id: 'enterprise', label: '💼 多业态企业级', rmb: '￥999 /月租', desc: '无限算力、专属定制高级 SPU 研发、Google Drive 全量物理冷灾备' }
                  ].map(tier => (
                    <div
                      key={tier.id}
                      onClick={() => {
                        setMerchantBillingTier(tier.id as any);
                        showToast(`👑 建议订阅套餐升级为: ${tier.label}`);
                      }}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                        merchantBillingTier === tier.id
                          ? 'border-amber-500 bg-amber-500/5 text-white'
                          : 'border-[#2F3336] bg-black text-zinc-400 hover:border-neutral-850'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black block text-white">{tier.label}</span>
                        {merchantBillingTier === tier.id && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <span className="text-xs text-amber-400 font-mono font-black mt-2 block">{tier.rmb}</span>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">{tier.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic balances & simulated topup pack */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-neutral-900/30 border border-[#2F3336]/50 p-5 rounded-xl space-y-4">
                  <h4 className="text-xs font-extrabold text-white font-mono">2.2 智算可用 Token 额度</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-450 font-mono">当前物理代扣余额:</span>
                      <span className="text-sky-400 font-black font-mono">{merchantTokenBalance.toLocaleString()} Tokens</span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                      <div className="h-full bg-sky-500 w-[78%]" />
                    </div>
                    <p className="text-[10.5px] text-zinc-500 leading-normal">
                      每次智体为您生成海报 (Varia AI)，或分析订单 (RAG)、调度机器人时均会扣除算力。建议保持在 500,000 以上防延迟。
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold block mb-2">充值算力包</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handlePerformSaaSTopup('token_pack', 49, 1000000, '算力扩容: 1,000,000 Tokens 补充包')}
                        className="p-2 border border-[#2F3336] bg-black hover:border-sky-500 rounded-lg text-left transition"
                      >
                        <p className="font-bold text-white">￥49 / 100万 Token</p>
                        <span className="text-[9.5px] text-zinc-500 font-mono block mt-0.5">高速 Gemini 特惠充配包</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePerformSaaSTopup('tier_upgrade', 299, 5000000, '专业月租包')}
                        className="p-2 border border-[#2F3336] bg-black hover:border-amber-500 rounded-lg text-left transition"
                      >
                        <p className="font-bold text-amber-400">￥299 / 尊享专业版</p>
                        <span className="text-[9.5px] text-zinc-500 font-mono block mt-0.5">追加 500万 算力包月首充</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Firestore Billing Logs list section */}
                <div className="bg-neutral-900/30 border border-[#2F3336]/50 p-5 rounded-xl space-y-3.5">
                  <h4 className="text-xs font-extrabold text-white flex justify-between font-mono">
                    <span>2.3 历史支付充值对账单簿</span>
                    <span className="text-[10.5px] text-emerald-400">¥{merchantRechargeTotal} RMB</span>
                  </h4>
                  
                  <div className="w-full h-px bg-[#2F3336]/40" />

                  {billingLogs.length === 0 ? (
                    <div className="p-7 text-center text-[10px] text-zinc-500 leading-normal border border-dashed border-[#2F3336] rounded-xl font-sans">
                      🛸 沙盒模式暂无人工付款账册。点击左侧的“算力包充值”即可自动向系统拉起真实对账日志，秒级同步入仓。
                    </div>
                  ) : (
                    <div className="max-h-[160px] overflow-y-auto divide-y divide-[#2F3336] pr-1">
                      {billingLogs.map((log, index) => (
                        <div key={log.id || index} className="py-2.5 text-[10.5px] font-mono flex justify-between items-center text-zinc-300">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white">{log.item}</span>
                            <span className="block text-[9.5px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-extrabold text-emerald-400">￥{log.amount} RMB</span>
                            <span className="block text-[9px] text-sky-400">+{log.tokensCredited?.toLocaleString()} T</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* 3. USERS & PERMISSIONS */}
          {activeTab === 'perms' && (
            <div className="space-y-6">
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">3.1 组织成员与 RBAC 权限大盘</h3>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  系统采用严格的多租户职权隔离防线。您的当前会话授权为：<strong className="text-sky-400">[{userRole}]</strong>。您可以一键在页面顶部控制台切换各视角，进行业务隔离和权限对撞测试。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { role: 'founder', name: '创始掌柜 (Founder)', detail: '最高阶所有权，可修改 API Key，控制 Google Drive 云备份、充值算力策略与抹除数据' },
                    { role: 'admin', name: '高级系统管理员 (Admin)', detail: '协助创始人执行所有 AI 网关注册、对接与商品全权改定价权' },
                    { role: 'manager', name: 'AI 项目大班 (Manager)', detail: '核心运营、配置提示词及发布促销活动，修改物流面单与顺丰承运权' },
                    { role: 'staff', name: '店内操作员 (Staff)', detail: '仅有基础商品查验及顾客纠纷手动调离权限。设置页面只读。' },
                    { role: 'customer', name: '普通顾客 (Customer)', detail: '前台购买，自动添加购物车结算对账，设置页面受严格拦截。' }
                  ].map(r => (
                    <div 
                      key={r.role}
                      className={`p-3.5 rounded-xl border text-left flex flex-col justify-between ${
                        userRole === r.role 
                          ? 'border-[#1D9BF0] bg-[#1D9BF0]/10 text-white' 
                          : 'border-neutral-900 bg-neutral-900/20 text-zinc-500'
                      }`}
                    >
                      <div>
                        <span className={`text-[10px] font-black tracking-wider uppercase font-mono ${userRole === r.role ? 'text-sky-400' : 'text-zinc-400'}`}>
                          {userRole === r.role ? '● 您当前处于此角色' : '○ 外部授权席位'}
                        </span>
                        <h4 className="text-xs font-extrabold text-white mt-1">{r.name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-1.5 leading-normal">{r.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">4.1 行商支付集成方案 (Check To Activate)</h3>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  无需填写复杂的商户号、对私签名串及防伪公钥。点击即可极速接通线上多款黄金结算网关，即勾即用，自动按在售国别外汇挂钩汇率结算！
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Stripe */}
                  <div 
                    onClick={() => {
                      setPaymentStripe(!paymentStripe);
                      showToast(`${paymentStripe ? '🔴 卸载' : '🔌 挂载'}了 Stripe 国际支付接线网关`);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer text-left transition flex items-center justify-between ${
                      paymentStripe ? 'border-[#38BDF8] bg-sky-500/5' : 'border-neutral-900 bg-black text-zinc-650'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>🌍 Stripe 国际双币网关</span>
                        {paymentStripe && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">ACTIVE</span>}
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">支持 Visa, MasterCard 跨国账单高精度轧平对账</p>
                    </div>
                    {paymentStripe ? <ToggleRight className="w-8 h-8 text-sky-400 shrink-0" /> : <ToggleLeft className="w-8 h-8 text-zinc-500 shrink-0" />}
                  </div>

                  {/* PayPal */}
                  <div 
                    onClick={() => {
                      setPaymentPaypal(!paymentPaypal);
                      showToast(`${paymentPaypal ? '🔴 卸载' : '🔌 挂载'}了 PayPal 国际对账套件`);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer text-left transition flex items-center justify-between ${
                      paymentPaypal ? 'border-[#38BDF8] bg-sky-500/5' : 'border-neutral-900 bg-black text-zinc-650'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>💳 PayPal 快速到账</span>
                        {paymentPaypal && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">ACTIVE</span>}
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">欧洲、北美买家黄金选择，含自动币种风险锁定</p>
                    </div>
                    {paymentPaypal ? <ToggleRight className="w-8 h-8 text-sky-400 shrink-0" /> : <ToggleLeft className="w-8 h-8 text-zinc-500 shrink-0" />}
                  </div>

                  {/* WeChatPay */}
                  <div 
                    onClick={() => {
                      setPaymentWechat(!paymentWechat);
                      showToast(`${paymentWechat ? '🔴 卸载' : '🔌 挂载'}了 微信原生直连支付网口`);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer text-left transition flex items-center justify-between ${
                      paymentWechat ? 'border-[#38BDF8] bg-sky-500/5' : 'border-neutral-900 bg-black text-zinc-650'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>🟢 微信支付官方直连户</span>
                        {paymentWechat && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">ACTIVE</span>}
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">支持微信内小程序、H5大字扫码秒级支付交易</p>
                    </div>
                    {paymentWechat ? <ToggleRight className="w-8 h-8 text-sky-400 shrink-0" /> : <ToggleLeft className="w-8 h-8 text-zinc-500 shrink-0" />}
                  </div>

                  {/* Alipay */}
                  <div 
                    onClick={() => {
                      setPaymentAlipay(!paymentAlipay);
                      showToast(`${paymentAlipay ? '🔴 卸载' : '🔌 挂载'}了 支付宝官方快捷网卡`);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer text-left transition flex items-center justify-between ${
                      paymentAlipay ? 'border-[#38BDF8] bg-sky-500/5' : 'border-neutral-900 bg-black text-zinc-650'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>🔵 支付宝企业全能接口</span>
                        {paymentAlipay && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">ACTIVE</span>}
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">支持刷脸自付、余额款项秒级清汇审计</p>
                    </div>
                    {paymentAlipay ? <ToggleRight className="w-8 h-8 text-sky-400 shrink-0" /> : <ToggleLeft className="w-8 h-8 text-zinc-500 shrink-0" />}
                  </div>

                </div>
              </div>

              {/* Mode Select */}
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">4.2 交易支付验证环境级别 (Gateway Target)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => {
                      setPaymentMode('sandbox');
                      showToast('● 切换至：模拟防真沙盒环境 (Sandbox)');
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      paymentMode === 'sandbox' 
                        ? 'border-sky-500 bg-sky-500/5' 
                        : 'border-neutral-900 bg-black text-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">🧪 模拟仿真沙盒支付环境 (Sandbox)</span>
                      {paymentMode === 'sandbox' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                    <p className="text-[10px] mt-1.5 text-zinc-400 leading-normal">顾客下单使用模拟账户即可结算对账，并在大盘生成实时流水，保障零金融风险调试。</p>
                  </div>

                  <div 
                    onClick={() => {
                      setPaymentMode('live');
                      showToast('● 切换至：线上真实商用Live环境');
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      paymentMode === 'live' 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-neutral-900 bg-black text-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">🔥 线上真实商业结算模式 (Production)</span>
                      {paymentMode === 'live' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] mt-1.5 text-zinc-400 leading-normal">使用 Stripe 与支付宝官方清汇路由。顾客需要完成真实金融卡扣款才通关发货程序。</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 5. CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              
              {/* Account tiers selection card */}
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">5.1 客户会员激励激励体系 (Customer VIP Program)</h3>
                
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { id: 'disabled', title: '关 闭', detail: '不设注册屏障' },
                    { id: 'basic', title: '基础会员', detail: '支持积分享折扣' },
                    { id: 'vip', title: 'VIP 多级会员', detail: '消费满返等会员卡' },
                    { id: 'premium', title: '高维专享会员', detail: '专属AI助理1对1定制' }
                  ].map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setCustomerMemberships(c.id as any);
                        showToast(`👥 已将会员激励程序设置为: ${c.title}`);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        customerMemberships === c.id 
                          ? 'border-sky-500 bg-sky-500/10 text-white font-bold' 
                          : 'border-neutral-900 bg-black text-zinc-500 hover:border-neutral-850'
                      }`}
                    >
                      <p className="text-xs text-white">{c.title}</p>
                      <p className="text-[9.5px] text-zinc-400 leading-tight mt-1 font-sans">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switches on automation & callback */}
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">5.2 AI 智能客户行为捕获与关怀追踪</h3>
                
                <div className="space-y-3.5">
                  
                  <div className="flex items-center justify-between text-xs bg-black p-3 rounded-xl border border-neutral-900">
                    <div>
                      <p className="font-bold text-white">自动跟踪并在 Firestore 归档顾客采购轨迹行为</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">留存高意向顾客的购物车热点、流失流出节点以备二次精准推送</p>
                    </div>
                    <button 
                      onClick={() => setCustomerAutoTrack(!customerAutoTrack)}
                      className="text-sky-400 shrink-0 select-none"
                    >
                      {customerAutoTrack ? <ToggleRight className="w-8 h-8 text-sky-400" /> : <ToggleLeft className="w-8 h-8 text-zinc-500" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-black p-3 rounded-xl border border-neutral-900">
                    <div>
                      <p className="font-bold text-white">启用超前 AI 智能分析与潜在肖像画像分析 (RAG Profiling)</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">自动评估顾客意图（高奢，价格敏感，观望者）并让专属 AI 客服自动切换措辞语境</p>
                    </div>
                    <button 
                      onClick={() => setCustomerAiProfiling(!customerAiProfiling)}
                      className="text-sky-400 shrink-0 select-none"
                    >
                      {customerAiProfiling ? <ToggleRight className="w-8 h-8 text-sky-400" /> : <ToggleLeft className="w-8 h-8 text-zinc-500" />}
                    </button>
                  </div>

                </div>
              </div>

              {/* Customer recall dropdown cards select */}
              <div className="bg-neutral-900/30 border border-neutral-900 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase font-mono">5.3 客户唤醒与异常挽回机制</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'ai', title: '🤖 AI 全天候话术挽留 (极力推荐)', desc: '发现加购未付款，AI客服于24小时内主动在聊天页发起限时赠品诱导' },
                    { id: 'sms', title: '📲 延迟短信召回通知', desc: '在适当地步发送 1 条包含优惠凭证的特惠短信。转化率极佳' },
                    { id: 'disabled', title: '🚫 关闭自动召回', desc: '不做任何打扰触达' }
                  ].map(rc => (
                    <div
                      key={rc.id}
                      onClick={() => {
                        setCustomerRecall(rc.id as any);
                        showToast(`召回关怀设定为: ${rc.title}`);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                        customerRecall === rc.id
                          ? 'border-sky-500 bg-sky-500/10 text-white text-xs'
                          : 'border-neutral-900 bg-black text-zinc-500 hover:border-neutral-800 animate-none'
                      }`}
                    >
                      <h4 className="text-xs text-white font-extrabold">{rc.title}</h4>
                      <p className="text-[9.5px] text-zinc-400 leading-normal mt-1.5 font-sans">{rc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 6. LOGISTICS */}
          {activeTab === 'logistics' && (
            <div className="space-y-6">
              
              {/* Warehouse options card select */}
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">6.1 保税发货中央母仓规划 (Fulfillment Warehouse)</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'shanghai', label: '⚓ 华东航空港中央主仓 (上海)', desc: '承载顺丰、中通航包枢纽，上海1小时极速上机发货' },
                    { id: 'guangzhou', label: '📦 南沙快反服装精配仓 (广州)', desc: '直通服装沙河、美妆快反供应链，拿货首选大仓' },
                    { id: 'crossborder', label: '✈ 跨境多式联运集散中心', desc: '包含出口退税中转仓和外币结售汇免税物理绑定' }
                  ].map(wh => (
                    <div
                      key={wh.id}
                      onClick={() => {
                        setSelectedWarehouse(wh.id as any);
                        showToast(`🚚 设定主力物理发货仓为：${wh.label}`);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                        selectedWarehouse === wh.id
                          ? 'border-sky-500 bg-sky-500/5 text-white'
                          : 'border-[#2F3336] bg-black text-zinc-400'
                      }`}
                    >
                      <span className="text-xs text-white font-bold block">{wh.label}</span>
                      <p className="text-[10px] text-zinc-400 mt-1.5 leading-normal">{wh.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery rule preset options */}
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">6.2 默认承运配送规则 (Delivery Methods)</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => {
                      setLogisticsRule('sf');
                      showToast('● 顺丰快递全能空运：发货即开单');
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                      logisticsRule === 'sf' ? 'border-sky-500 bg-sky-500/10' : 'border-neutral-900 bg-black text-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>🚀 顺丰特快空运 (推荐)</span>
                      {logisticsRule === 'sf' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </div>
                    <p className="text-[10px] mt-1.5 text-zinc-400 leading-normal">90%商户首选，自动通过顺丰API打出面单，航空货运干线，带保价条款。</p>
                  </div>

                  <div
                    onClick={() => {
                      setLogisticsRule('local');
                      showToast('● 同城极速骑手揽派');
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                      logisticsRule === 'local' ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-900 bg-black text-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>🛵 美团外卖/同城半小时达</span>
                      {logisticsRule === 'local' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <p className="text-[10px] mt-1.5 text-zinc-400 leading-normal">尤其适合餐饮外卖和理发美业。系统捕获订单后秒级触发同城跑腿上门提物。</p>
                  </div>

                  <div
                    onClick={() => {
                      setLogisticsRule('self');
                      showToast('● 到店自提/纯数字化履约');
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                      logisticsRule === 'self' ? 'border-emerald-500 bg-emerald-500/5' : 'border-neutral-900 bg-black text-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>🛍️ 到店核销 / 纯线上消费</span>
                      {logisticsRule === 'self' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] mt-1.5 text-zinc-400 leading-normal">不需要任何货运发件。顾客凭生成的电子提单码现场对账核销，或享数字化产品及课程。</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 7. MARKET & BRANDING */}
          {activeTab === 'marketing_brand' && (
            <div className="space-y-6">
              
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">7.1 独立站云域名解析 (Domain Configuration)</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => {
                      setDomainType('subdomain');
                      showToast('● 采用默认二级子域名');
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      domainType === 'subdomain' ? 'border-sky-500 bg-sky-500/5' : 'border-[#2F3336] bg-black text-zinc-400'
                    }`}
                  >
                    <span className="text-xs text-white font-bold block">🌐 免费默认子域名</span>
                    <span className="text-[10px] font-mono text-sky-400 mt-1 block truncate">{subdomainText}</span>
                    <p className="text-[10px] text-zinc-500 mt-1">无需任何配置拥有自主所有权。</p>
                  </div>

                  <div
                    onClick={() => {
                      setDomainType('custom');
                      showToast('● 期待绑定您的企业独立大域名');
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      domainType === 'custom' ? 'border-sky-500 bg-sky-500/5' : 'border-[#2F3336] bg-black text-zinc-400'
                    }`}
                  >
                    <span className="text-xs text-white font-bold block">🔥 独立尊享自定义域名</span>
                    <span className="text-[10px] font-mono text-amber-500 mt-1 block truncate">e.g., custom-brand.com</span>
                    <p className="text-[10px] text-zinc-500 mt-1">仅需修改 CNAME 指向 MODA 防火墙节点即可。</p>
                  </div>

                  <div
                    onClick={() => {
                      setDomainType('relay');
                      showToast('● 启用多终端异构安全中继域名');
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      domainType === 'relay' ? 'border-sky-500 bg-sky-500/5' : 'border-[#2F3336] bg-black text-zinc-400'
                    }`}
                  >
                    <span className="text-xs text-white font-bold block">🛡️ SSL多端中继混停</span>
                    <span className="text-[10px] font-mono text-emerald-400 mt-1 block truncate">cdn-modashield.net</span>
                    <p className="text-[10px] text-zinc-500 mt-1">多平台发布抗高防DDoS拦截。</p>
                  </div>
                </div>
              </div>

              {/* Currency & Accent Themes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-neutral-900/30 border border-neutral-900 p-5 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase font-mono">7.2 入账基本货币 (Currency Anchor)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'CNY', label: '人民币 (RMB ¥)' },
                      { id: 'USD', label: '美元 (USD $)' },
                      { id: 'EUR', label: '欧元 (EUR €)' }
                    ].map(cur => (
                      <button
                        key={cur.id}
                        type="button"
                        onClick={() => {
                          setCurrentCurrency(cur.id as any);
                          showToast(`💱 店铺基色外币结算锚点更改为: ${cur.label}`);
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition ${
                          currentCurrency === cur.id 
                            ? 'border-sky-500 bg-sky-500/10 text-white' 
                            : 'border-neutral-900 bg-black text-zinc-540'
                        }`}
                      >
                        {cur.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900/30 border border-neutral-900 p-5 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase font-mono">7.3 店面核心视觉主题 (Storefront Theme)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'dark', label: '潮冷暗黑 🌑' },
                      { id: 'classic', label: '现代极简 ⚪' },
                      { id: 'retro', label: '奶油法式 🧺' }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setStoreTheme(theme.id as any);
                          showToast(`🎨 独立店面视觉主题热重更新为: ${theme.label}`);
                        }}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition ${
                          storeTheme === theme.id 
                            ? 'border-[#1D9BF0] bg-[#1D9BF0]/15 text-white' 
                            : 'border-neutral-900 bg-black text-zinc-540'
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 8. APPS FOR MULTI-CHANNEL ACTION */}
          {activeTab === 'apps' && (
            <div className="space-y-6">
              
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">8.1 预设扩展应用组件 (Core Plugin Add-ons)</h3>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  这些是从 App Store 一键安装的云扩展运行层。随时可以通过勾选一键接通，赋予全自动化数字资产对账与跨多平台分发的能力。
                </p>

                <div className="space-y-3">
                  
                  <div className="flex items-center justify-between text-xs bg-black p-4 rounded-xl border border-neutral-900">
                    <div className="text-left">
                      <p className="font-extrabold text-white flex items-center gap-2">
                        <span>🤖 AI 自动发掘爆品与社交直通投放</span>
                        <span className="text-[8.5px] bg-sky-500/20 text-sky-400 border border-sky-500/40 px-1 py-0.5 rounded font-mono">INSTALLED</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-sans">自动结合 RAG，捕获公网上流行服饰/网红菜谱并在店铺高溢价上架营销</p>
                    </div>
                    <button 
                      onClick={() => setAppAiMarketing(!appAiMarketing)}
                      className="text-sky-400 shrink-0 select-none"
                    >
                      {appAiMarketing ? <ToggleRight className="w-8 h-8 text-sky-400" /> : <ToggleLeft className="w-8 h-8 text-zinc-500" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-black p-4 rounded-xl border border-neutral-900">
                    <div className="text-left">
                      <p className="font-extrabold text-white flex items-center gap-2">
                        <span>🔄 跨多渠道库存安全瞬时锁仓同步对账 (Omnichannel Grid)</span>
                        <span className="text-[8.5px] bg-sky-500/20 text-sky-400 border border-sky-500/40 px-1 py-0.5 rounded font-mono">INSTALLED</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-sans">防止多店库存超卖。任何在 TikTok、小红书、淘宝有款成交便立即全线拦截锁余量包</p>
                    </div>
                    <button 
                      onClick={() => setAppInventoryAlign(!appInventoryAlign)}
                      className="text-sky-400 shrink-0 select-none"
                    >
                      {appInventoryAlign ? <ToggleRight className="w-8 h-8 text-sky-400" /> : <ToggleLeft className="w-8 h-8 text-zinc-500" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-black p-4 rounded-xl border border-neutral-900">
                    <div className="text-left">
                      <p className="font-extrabold text-white flex items-center gap-2">
                        <span>🗣️ AI 实时翻译和多币种自动抹账</span>
                        <span className="text-[8.5px] bg-amber-500/10 text-amber-400 border border-amber-550/20 px-1 py-0.5 rounded font-mono">STORE ADD-ON</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-sans">将您的全部产品名录针对出口国语境，秒级自动翻译为英文、韩文和泰文以拓展跨境客资</p>
                    </div>
                    <button 
                      onClick={() => setAppLiveTranslation(!appLiveTranslation)}
                      className="text-sky-400 shrink-0 select-none"
                    >
                      {appLiveTranslation ? <ToggleRight className="w-8 h-8 text-sky-400" /> : <ToggleLeft className="w-8 h-8 text-zinc-500" />}
                    </button>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* 9. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">9.1 实时业务警告与催单通知 (Core Alert Hub)</h3>
                
                <div className="space-y-3">
                  
                  <div 
                    onClick={() => setNotifySms(!notifySms)}
                    className="p-4 bg-black rounded-xl border border-neutral-900 hover:border-[#1D9BF0]/30 transition text-xs text-left cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-sky-400" />
                        <span>自动顺丰面单出货极速短信 (SMS Carrier Alert)</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-sans">当顺丰承运中心完成揽件扣款时，自动向买家手机推送物流凭证与实时轨迹。有效降低95%售后纠纷率！</p>
                    </div>
                    {notifySms ? <Check className="w-4 h-4 text-sky-400 shrink-0" /> : <div className="w-4 h-4 border border-zinc-700 rounded-full shrink-0" />}
                  </div>

                  <div 
                    onClick={() => setNotifyEmail(!notifyEmail)}
                    className="p-4 bg-black rounded-xl border border-neutral-900 hover:border-[#1D9BF0]/30 transition text-xs text-left cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-sky-400" />
                        <span>每日财务轧账利润单对账邮件 (Daily Profit Report)</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-sans">每晚24点，系统自动汇总今日跨端 sales 成交、RAG消耗和租户算力明细发给您注册的邮箱：chi2030ai@gmail.com</p>
                    </div>
                    {notifyEmail ? <Check className="w-4 h-4 text-sky-400 shrink-0" /> : <div className="w-4 h-4 border border-zinc-700 rounded-full shrink-0" />}
                  </div>

                  <div 
                    onClick={() => setNotifyWechat(!notifyWechat)}
                    className="p-4 bg-black rounded-xl border border-neutral-900 hover:border-[#1D9BF0]/30 transition text-xs text-left cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                        <span>微信官方服务号异常报警推送 (WeChat Service Alert)</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-sans">当发生特大纠纷告警、极速退款未妥首善处理、或可用 Token 掉入10,000红色警戒限时启动报警。</p>
                    </div>
                    {notifyWechat ? <Check className="w-4 h-4 text-sky-400 shrink-0" /> : <div className="w-4 h-4 border border-zinc-700 rounded-full shrink-0" />}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* 10. LANGUAGES */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">10.1 系统本地化前端翻译语言</h3>
                
                <div className="grid grid-cols-3 gap-3 text-left">
                  {[
                    { id: 'zh_CN', label: '简体中文 (Default zh_CN)', detail: '100% 极速承装完成，含专家智体专属方言支持' },
                    { id: 'en_US', label: 'English (US Translation)', detail: '完整适配海外 Stripe 下单流程和高可用 API 回执' },
                    { id: 'ja_JP', label: '日本語', detail: '支持東京快反供应、亚马逊跨境店多维同步适配' }
                  ].map(lang => (
                    <div
                      key={lang.id}
                      onClick={() => {
                        setSelectedLanguage(lang.id as any);
                        showToast(`🗣️ 系统多国语言切换为: ${lang.label}`);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        selectedLanguage === lang.id ? 'border-[#1D9BF0] bg-[#1D9BF0]/10 text-white' : 'border-neutral-900 bg-black text-zinc-500'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black block text-white">{lang.label}</span>
                        <p className="text-[10px] text-zinc-400 leading-normal mt-1.5 font-sans">{lang.detail}</p>
                      </div>
                      {selectedLanguage === lang.id && <span className="text-sky-400 text-[10px] font-bold font-mono mt-2 flex items-center">● 已作为基础语言</span>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 11. POLICIES */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">11.1 主体隐私与交易保障协议 (Auto Generator)</h3>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  无需专业的法律顾问起草规章。勾选即可在您的店面买家底页自动挂载最高质、最合规的法律契约模板。
                </p>

                <div className="space-y-3">
                  
                  <div 
                    onClick={() => setPolicyRefund7Days(!policyRefund7Days)}
                    className="p-3.5 bg-black rounded-xl border border-[#2F3336]/50 hover:border-sky-500/40 cursor-pointer flex justify-between items-center transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">☑ 7天无理由退换货保障条款 (Refund Policy)</p>
                      <p className="text-[9.5px] text-zinc-500 mt-1 font-sans">包含完整的拆包防伪扣签标准及顺丰到付拒签规范。让AI客服依此退款。</p>
                    </div>
                    {policyRefund7Days ? <Check className="w-4 h-4 text-sky-400 shrink-0" /> : <div className="w-4 h-4 border border-zinc-700 rounded-full shrink-0" />}
                  </div>

                  <div 
                    onClick={() => setPolicyPrivacy(!policyPrivacy)}
                    className="p-3.5 bg-black rounded-xl border border-[#2F3336]/50 hover:border-sky-500/40 cursor-pointer flex justify-between items-center transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">☑ MODAUI 物理安全多租户数据隐私保护公报 (Privacy Policy)</p>
                      <p className="text-[9.5px] text-zinc-500 mt-1 font-sans font-sans">确保采购信息、顾客电话经 AES-256 全天候加密，保障完全符合国际隐私法案。</p>
                    </div>
                    {policyPrivacy ? <Check className="w-4 h-4 text-sky-400 shrink-0" /> : <div className="w-4 h-4 border border-zinc-700 rounded-full shrink-0" />}
                  </div>

                  <div 
                    onClick={() => setPolicyGdprCookie(!policyGdprCookie)}
                    className="p-3.5 bg-black rounded-xl border border-[#2F3336]/50 hover:border-sky-500/40 cursor-pointer flex justify-between items-center transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">☐ 欧盟 GDPR 极严 Cookie 同意框通知 (GDPR Cookie Banner)</p>
                      <p className="text-[9.5px] text-zinc-500 mt-1 font-sans">当具有欧洲及美加 IP 消费者进店时，底部触发半透明 Cookie 浮屏允许声明。</p>
                    </div>
                    {policyGdprCookie ? <Check className="w-4 h-4 text-sky-400 shrink-0" /> : <div className="w-4 h-4 border border-zinc-700 rounded-full shrink-0" />}
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* 12. AI TEAM CONFIG & GPUS */}
          {activeTab === 'ai_team' && (
            <div className="space-y-6">
              
              {/* Select high performance LLM Models */}
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">12.1 专家智能所搭载的大语言模型 (Model Engines)</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-left">
                  {[
                    { id: 'gemini', label: 'Google Gemini', desc: '1.5 Flash 通用旗舰', color: 'border-sky-500 text-sky-400 bg-sky-500/5' },
                    { id: 'deepseek', label: 'DeepSeek V3', desc: '顶尖推理极速模型', color: 'border-blue-700 text-blue-400 bg-blue-900/5' },
                    { id: 'openai', label: 'OpenAI GPT-4', desc: '强悍通用智能芯片', color: 'border-emerald-600 text-emerald-400 bg-emerald-950/5' },
                    { id: 'ollama', label: 'Ollama 本地引擎', desc: '极速零费内嵌网络', color: 'border-zinc-700 text-zinc-300' }
                  ].map(model => {
                    const isActive = apiProvider === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => {
                          setApiProvider(model.id as any);
                          setTestConnectionStatus('idle');
                          setTestLog(`[智推热切] 通信核心模型设定更换为: ${model.label}`);
                          showToast(`🤖 模型核心设定为: ${model.label}`);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between min-h-[90px] ${
                          isActive ? model.color : 'border-neutral-900 bg-black text-zinc-500 hover:border-neutral-800'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black block text-white">{model.label}</span>
                          <span className="text-[9.5px] text-zinc-400 font-mono mt-1.5 block">{model.desc}</span>
                        </div>
                        {isActive && <span className="text-[9px] font-mono font-bold mt-2 text-sky-400">● 生产接通中</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Key Input / Connection testing panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-xl space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">12.2 底层秘钥连接库</h4>
                  
                  {apiProvider === 'gemini' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">Gemini API Key</label>
                      <input 
                        type="password" 
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  )}

                  {apiProvider === 'deepseek' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">DeepSeek API Key</label>
                      <input 
                        type="password" 
                        value={deepseekKey}
                        onChange={(e) => setDeepseekKey(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  )}

                  {apiProvider === 'openai' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block">OpenAI API Key</label>
                      <input 
                        type="password" 
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] focus:border-sky-500 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  )}

                  {apiProvider === 'ollama' && (
                    <div className="space-y-3 text-[11px]">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-[#8B949E] block">Ollama 端点宿主 (Endpoint)</label>
                        <input 
                          type="text" 
                          value={ollamaEndpoint}
                          onChange={(e) => setOllamaEndpoint(e.target.value)}
                          className="w-full bg-black border border-[#2F3336] rounded-lg p-2 text-white font-mono"
                          placeholder="http://localhost:11434"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-[#8B949E] block">手动指定内网高性能模型名</label>
                        <input 
                          type="text" 
                          value={ollamaModel}
                          onChange={(e) => setOllamaModel(e.target.value)}
                          className="w-full bg-black border border-[#2F3336] rounded-lg p-2 text-white font-mono"
                          placeholder="qwen2.5:7b"
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-[9.5px] text-zinc-500 leading-normal">
                    如果您未配置任何私有 AI key。系统会全自动切换至 <strong>AI Studio 统一云托管托管冷热仿真通道</strong> 运行，完美保证100%全功能。
                  </p>
                </div>

                {/* Diagnostic feedback panel */}
                <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-xl space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">12.3 自动通信链路测试网</h4>
                  
                  <div className="bg-[#050505] border border-neutral-900 p-3 rounded-lg text-[10.5px] text-sky-400 font-mono min-h-[90px] text-left leading-relaxed break-all whitespace-pre-wrap">
                    {testLog || "💡 链路日志空白。随时点击下方“发起双向探测”。"}
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerStatusCheck}
                    className="w-full py-2 bg-neutral-900 border border-[#2F3336] hover:bg-neutral-850 hover:border-neutral-700 text-xs font-bold text-white rounded-lg flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${testConnectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                    <span>⚡ 发起双向 SSL 握手探测</span>
                  </button>
                </div>

              </div>

              {/* Reset Section & Google Drive Cloud backup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#2F3336]/30 pt-4">
                
                {/* 12.4 Google Drive backup */}
                <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-xl space-y-3.5">
                  <h4 className="text-xs font-extrabold text-white flex justify-between font-mono">
                    <span>12.4 Google Drive 物理云备份</span>
                    <span className="text-[10px] text-sky-400">已中继保障</span>
                  </h4>
                  
                  {!driveAccessToken ? (
                    <div className="space-y-3 text-[11px] text-zinc-400">
                      <p>🔌 绑定您的 Cloud Storage / Google Drive。将商品名册、真实的客户付款与账账流向全量加密冷备份。</p>
                      <button
                        type="button"
                        onClick={handleConnectDrive}
                        className="w-full py-2.5 bg-[#1D9BF0] hover:bg-[#38BDF8] text-white font-bold rounded-lg text-xs"
                      >
                        🔑 进行 Google OAuth 绑定授权
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-[11.5px]">
                      <div className="flex justify-between items-center text-[10px] bg-black p-2 rounded">
                        <span>邮箱: <strong className="text-sky-400 font-mono">{driveUserEmail}</strong></span>
                        <button onClick={handleDisconnectDrive} className="text-red-400">登出</button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleBackupToDrive}
                        disabled={isBackingUp}
                        className="w-full py-2 bg-neutral-900 border border-[#2F3336] text-white font-bold rounded text-xs flex justify-center items-center gap-2"
                      >
                        {isBackingUp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5 text-sky-400" />}
                        <span>💾 极速备份至云盘 (Drive)</span>
                      </button>

                      {driveBackups.length > 0 && (
                        <div className="space-y-1.5 pt-1.5 border-t border-neutral-900">
                          <label className="text-[9.5px] text-zinc-5 text-left block">选择历史备份点还原：</label>
                          <select 
                            value={selectedBackupId} 
                            onChange={(e) => setSelectedBackupId(e.target.value)}
                            className="bg-black border border-neutral-900 text-xs p-1.5 rounded w-full text-white"
                          >
                            {driveBackups.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleRestoreFromDrive}
                            className="w-full py-1.5 text-yellow-400 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 rounded mt-1"
                          >
                            🔄 一键反解析还原大盘
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 12.5 Production wipe */}
                <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-xl space-y-3.5">
                  <h4 className="text-xs font-extrabold text-white flex justify-between font-mono">
                    <span>12.5 生产就绪数据彻底抹除（上线清零）</span>
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    系统目前处于试用仿真的沙盒状态。当您要把这间公司一键推到线上承接真正消费者真实成交时，为了合规避税，必须一键清零历史模拟的 transaction。
                  </p>
                  
                  <div className="flex items-center space-x-2.5">
                    <input 
                      type="checkbox" 
                      id="wipe_products_check"
                      checked={wipeProductsInPurge}
                      onChange={(e) => setWipeProductsInPurge(e.target.checked)}
                      className="rounded border-[#2F3336] bg-black text-red-600 focus:ring-red-600 w-3.5 h-3.5 cursor-pointer"
                    />
                    <label htmlFor="wipe_products_check" className="text-[10px] text-zinc-400 leading-none cursor-pointer">
                      同时抹除在售商品名录 SPU (否则只清除销售流水和订单)
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProductionPurge(wipeProductsInPurge)}
                    className="w-full py-2 bg-red-950/20 border border-red-900/50 hover:bg-red-900/30 text-rose-500 font-extrabold text-xs rounded transition flex items-center justify-center space-x-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>🧹 抹除清空测试数据，准备上线</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* 13. KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              
              <div className="bg-neutral-900/30 border border-[#2F3336]/60 p-5 rounded-2xl space-y-4 text-left">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">13.1 智体垂直知识库 (RAG Vector Indexes)</h3>
                <p className="text-[10.5px] text-zinc-400 leading-normal">
                  知识库是智脑专家在进行采购报价、服装面料研发、烹饪原料折旧核算时的标准依据。系统依据您所处行业自动装填并矢量索引了如下文档，供 AI 数字军师常驻提炼检索！
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'industry_rules', title: `📘 ${industry.name}行业规范与高溢价营销法则`, chunk: '3,240 矢量的 Chunk 段落', info: '引导设计和选品顾问撰写绝顶抓人眼球的精品行销案' },
                    { id: 'supplier_docs', title: `📒 顺丰空运揽货扣折率及华东港大仓对账指引`, chunk: '1,490 矢量的 Chunk 段落', info: '自动指点运营总办进行每日运单差额提现跟进' },
                    { id: 'dispute_rules', title: `📙 CRM 恶意退款拦截拦截及安抚客情金律`, chunk: '890 矢量的 Chunk 段落', info: '让客服智体不费吹灰一兵一卒撤回大阿姨的申诉纠葛' },
                    { id: 'custom_knows', title: `📓 自定义商号在售商品规格字典 (Products SPU)`, chunk: `${productsList.length} 条物理数据记录`, info: '随时被 AI 商品中心动态抓取并为前台到店客对账纠错' }
                  ].map(doc => (
                    <div key={doc.id} className="p-3.5 rounded-xl border border-neutral-900 bg-black text-xs text-left text-zinc-300 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-white block truncate">{doc.title}</span>
                        <span className="text-[9.5px] text-sky-400 font-mono mt-0.5 block">{doc.chunk}</span>
                        <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed font-sans">{doc.info}</p>
                      </div>
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded mt-3.5 inline-block self-start font-bold">● 已入矢量大内存</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
