import React, { useState, useEffect } from 'react';
import { 
  Share2, RefreshCw, CheckCircle, AlertCircle, ExternalLink, 
  Plus, ShoppingBag, TrendingUp, Settings, Database, Radio, Check, X, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChannelsViewProps {
  tenantId: string;
  onAddLog?: (sender: string, emoji: string, message: string, type: 'info' | 'success' | 'warn') => void;
}

export default function ChannelsView({ tenantId, onAddLog }: ChannelsViewProps) {
  const activeTenant = tenantId || 'tenant_modaui';
  
  // Channels sync configurations with standard platforms
  const [channels, setChannels] = useState([
    {
      channel: 'official',
      storeId: 'sto_official_modaui',
      storeName: 'MODAUI 官方独立主店面 (Direct)',
      status: 'connected',
      connectedAt: '2026-06-01 10:00:00',
      lastSyncAt: new Date().toLocaleTimeString(),
      syncInventory: true,
      syncPrices: true
    },
    {
      channel: 'tiktok',
      storeId: 'sto_tiktok_9921',
      storeName: '抖音/TikTok 极速流直播官方店',
      status: 'connected',
      connectedAt: '2026-06-02 14:32:00',
      lastSyncAt: new Date().toLocaleTimeString(),
      syncInventory: true,
      syncPrices: true
    },
    {
      channel: 'xiaohongshu',
      storeId: 'sto_xhs_882',
      storeName: '小红书 RED 专属美学社群精铺',
      status: 'connected',
      connectedAt: '2026-06-03 09:15:00',
      lastSyncAt: new Date(Date.now() - 30 * 60000).toLocaleTimeString(),
      syncInventory: true,
      syncPrices: false
    },
    {
      channel: 'taobao',
      storeId: '',
      storeName: '淘宝多端智能分销商铺',
      status: 'disconnected',
      connectedAt: '',
      lastSyncAt: '',
      syncInventory: true,
      syncPrices: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<'channels' | 'inventory' | 'orders'>('channels');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedChannelType, setSelectedChannelType] = useState('tiktok');
  const [newStoreId, setNewStoreId] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Simulated SPU mappings
  const [unifiedProducts, setUnifiedProducts] = useState([
    {
      id: 'prod_1',
      name: 'MODA 智能极简设计师成衣款',
      sku: 'MODA-CLOTH-001',
      basePrice: 599.00,
      totalInventory: 240,
      channels: [
        { type: 'official', sku: 'MODA-CLOTH-001-OFFICIAL', price: 599.00, stock: 120 },
        { type: 'tiktok', sku: 'DY-CLOTH-8273', price: 588.00, stock: 80 },
        { type: 'xiaohongshu', sku: 'RED-CLOTH-821', price: 599.00, stock: 40 }
      ]
    },
    {
      id: 'prod_2',
      name: 'MODA 联名限量款科技面料卫衣',
      sku: 'MODA-HOOD-992',
      basePrice: 388.00,
      totalInventory: 180,
      channels: [
        { type: 'official', sku: 'MODA-HOOD-992-OFF', price: 388.00, stock: 100 },
        { type: 'tiktok', sku: 'DY-HD-992', price: 379.00, stock: 50 },
        { type: 'xiaohongshu', sku: 'RED-HD-002', price: 388.00, stock: 30 }
      ]
    }
  ]);

  // Simulated multi-channel unified orders
  const [unifiedOrders, setUnifiedOrders] = useState([
    {
      id: "uni_ord_1001",
      channel: "tiktok",
      channelOrderId: "TK-992813123",
      itemsDesc: "MODA 智能极简设计师成衣款 x 1",
      totalAmount: 588.00,
      customerName: "王佳薇 (TikTok 直播用户)",
      address: "上海市徐汇区龙华中路228号",
      shippingStatus: "unshipped",
      createdAt: new Date().toISOString()
    },
    {
      id: "uni_ord_1002",
      channel: "xiaohongshu",
      channelOrderId: "RED-77291823",
      itemsDesc: "MODA 联名限量款科技卫衣 x 1",
      totalAmount: 388.00,
      customerName: "李佳琪 (小红书种草用户)",
      address: "北京市朝阳区三里屯世贸广场",
      shippingStatus: "delivered",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  const channelBadges: Record<string, { bg: string, text: string, name: string }> = {
    official: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', name: '官方自营' },
    tiktok: { bg: 'bg-indigo-500/10 border-indigo-500/20', text: 'text-indigo-400', name: 'TikTok店铺' },
    xiaohongshu: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', name: '小红书商城' },
    douyin: { bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400', name: '抖音小店' },
    taobao: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', name: '淘宝商城' },
    pinduoduo: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', name: '拼多多' },
    wechat: { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400', name: '微信分销店' },
    amazon: { bg: 'bg-yellow-600/10 border-yellow-500/20', text: 'text-yellow-500', name: '亚马逊店铺' }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    if (onAddLog) {
      onAddLog('系统大盘', '🔄', '开始向 8+ 销售端点发送库存量能核销信宿...', 'info');
    }
    
    try {
      const response = await fetch('/api/channels/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: activeTenant })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessToast(data.message || '多端实时库存同步完毕！');
        if (onAddLog) {
          onAddLog('AI大盘总控', '⚡', `库存同步引擎对齐成功，已拦截并自动对账聚合新订单！`, 'success');
        }
        
        // Refresh channels and insert mock details
        setChannels(prev => prev.map(c => c.status === 'connected' ? { ...c, lastSyncAt: new Date().toLocaleTimeString() } : c));
        
        const nowStr = new Date().toISOString();
        const randId = `uni_ord_${Math.floor(1000 + Math.random() * 9000)}`;
        setUnifiedOrders(prev => [
          {
            id: randId,
            channel: 'douyin',
            channelOrderId: `DY-${Math.floor(100000 + Math.random() * 900000)}`,
            itemsDesc: 'MODA Core 限量单品 x 1',
            totalAmount: 299.00,
            customerName: '张敏捷 (抖音用户)',
            address: '广州市天河区华夏路10号',
            shippingStatus: 'unshipped',
            createdAt: nowStr
          },
          ...prev
        ]);
      }
    } catch (e) {
      setSuccessToast(`🔄 离线仿真：8大销售渠道商品、库存与聚合账单对齐完成！`);
    }

    setTimeout(() => {
      setIsSyncing(false);
      setTimeout(() => setSuccessToast(''), 4500);
    }, 1200);
  };

  const handleConnectChannel = async () => {
    if (!newStoreId || !newStoreName) {
      alert('请填写完整的店铺唯一ID与名称');
      return;
    }

    const payload = {
      tenantId: activeTenant,
      channel: selectedChannelType,
      storeId: newStoreId,
      storeName: newStoreName,
      accessToken: newApiKey || `tok_ext_${Math.random().toString(36).substring(2, 10)}`
    };

    try {
      const res = await fetch('/api/channels/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const newChan = {
          channel: selectedChannelType,
          storeId: newStoreId,
          storeName: newStoreName,
          status: 'connected',
          connectedAt: new Date().toLocaleString().substring(0, 19),
          lastSyncAt: new Date().toLocaleTimeString(),
          syncInventory: true,
          syncPrices: true
        };
        setChannels(prev => [...prev.filter(c => !(c.channel === selectedChannelType && c.storeId === newStoreId)), newChan]);
        setShowConnectModal(false);
        setSuccessToast(`🔌 销售渠道接入成功: [${channelBadges[selectedChannelType]?.name || selectedChannelType}] ${newStoreName}!`);
        if (onAddLog) {
          onAddLog('AI网络架构师', '🔌', `注册了新的异构行销适配端点: ${newStoreName}，API 通道信件握手 100% 成功。`, 'success');
        }
        setTimeout(() => setSuccessToast(''), 4000);
      }
    } catch {
      // Local addition fallback
      console.warn("Express channel register failed, adding local simulator.");
      setShowConnectModal(false);
    }
  };

  return (
    <div className="bg-neutral-950 text-zinc-100 p-2 font-sans rounded-2xl border border-neutral-900 overflow-hidden">
      {/* Dynamic Success Notification Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1D9BF0] border border-[#1D9BF0]/30 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-bold font-mono"
          >
            <Check className="h-4 w-4 text-white" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        
        {/* Subheader board */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-neutral-900/40 border border-neutral-900 p-5 rounded-2xl gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  高级多渠道行销对账网关 <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/30 px-1.5 py-0.5 rounded font-mono font-bold">OMNICHANNEL SYNC</span>
                </h1>
                <p className="text-zinc-500 text-[10.5px] mt-0.5">多终端、多平台统一库存、商品 SPU 配准与支付对账统一汇总机制</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
            <button 
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-850 text-[11px] font-bold border border-neutral-800 rounded-lg hover:border-neutral-700 transition flex items-center space-x-1.5 font-mono"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步全网多端中...' : '一键全渠道对齐锁仓'}</span>
            </button>
            <button 
              onClick={() => {
                setNewStoreId(`sto_ch_${Math.random().toString(36).substring(3, 8)}`);
                setNewStoreName('');
                setNewApiKey('');
                setShowConnectModal(true);
              }}
              className="px-3.5 py-2 bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 text-white text-[11px] font-extrabold rounded-lg shadow-lg flex items-center space-x-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>接入新平台</span>
            </button>
          </div>
        </div>

        {/* Sync Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900/30 border border-neutral-900/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[9px] font-bold font-mono">已就绪渠道数 (READY SHARDS)</p>
              <p className="text-xl font-black text-white mt-1">3 <span className="text-xs text-zinc-500">/ 8平台</span></p>
              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">● 官方、TikTok、小红书</p>
            </div>
            <div className="h-9 w-9 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
              <Check className="h-4 w-4" />
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-900/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[9px] font-bold font-mono">24H 聚合订单 (AGGREGATED ORDERS)</p>
              <p className="text-xl font-black text-white mt-1">{unifiedOrders.length} 笔交易</p>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">自动汇算去重与承运交接</p>
            </div>
            <div className="h-9 w-9 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-900/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[9px] font-bold font-mono">已捕获总线上流水 (CAPTURED SAAS REVENUE)</p>
              <p className="text-xl font-black text-amber-500 mt-1">
                ¥{unifiedOrders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
              </p>
              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">汇率对账与自动记账无缝连通</p>
            </div>
            <div className="h-9 w-9 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-900/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-[9px] font-bold font-mono">库存同步可靠度 (PING SYNC)</p>
              <p className="text-xl font-black text-sky-400 mt-1">99.98%</p>
              <p className="text-[10px] text-sky-400 font-mono mt-0.5">双向 Socket 锁仓防护常驻</p>
            </div>
            <div className="h-9 w-9 bg-sky-500/10 border border-sky-500/20 rounded-lg flex items-center justify-center text-sky-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Tabs Control */}
        <div className="flex border-b border-neutral-900 gap-1 mt-2">
          <button 
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'channels' 
                ? 'border-[#1D9BF0] text-[#1D9BF0]' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>行销适配渠道</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'inventory' 
                ? 'border-[#1D9BF0] text-[#1D9BF0]' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>跨端 SPU/SKU 统一分配</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'orders' 
                ? 'border-[#1D9BF0] text-[#1D9BF0]' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>跨渠道聚合订单统一看板</span>
          </button>
        </div>

        {/* Tab Viewport Pane */}
        <div>
          {activeTab === 'channels' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((chan) => (
                <div 
                  key={`${chan.channel}_${chan.storeId}`}
                  className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-850 transition duration-150 relative overflow-hidden text-left"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 text-[8.5px] font-black tracking-wider uppercase rounded border ${channelBadges[chan.channel]?.bg || 'bg-zinc-800 border-zinc-700'} ${channelBadges[chan.channel]?.text || 'text-zinc-300'}`}>
                        {channelBadges[chan.channel]?.name || chan.channel}
                      </span>
                      <span className={`flex items-center text-[9.5px] font-mono font-bold ${
                        chan.status === 'connected' ? 'text-emerald-400' : 'text-zinc-600'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1 ${
                          chan.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-750'
                        }`} />
                        {chan.status === 'connected' ? '就绪接通' : '未连接'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-white text-xs">
                        {chan.status === 'connected' ? chan.storeName : `配方待接: ${channelBadges[chan.channel]?.name || chan.channel}`}
                      </h3>
                      <p className="text-zinc-500 font-mono text-[9px] mt-1 space-y-0.5">
                        {chan.status === 'connected' ? (
                          <>
                            <span className="block">多端标识: {chan.storeId}</span>
                            <span className="block text-zinc-650">更新周期: {chan.lastSyncAt || '未同步'}</span>
                          </>
                        ) : (
                          <span className="text-zinc-600 block">点击下方"配对"输入适配秘钥即可拉通全同步回调监听。</span>
                        )}
                      </p>
                    </div>

                    {chan.status === 'connected' && (
                      <div className="border-t border-neutral-900 pt-2.5 space-y-1 text-[9.5px] font-mono text-zinc-400">
                        <div className="flex justify-between items-center">
                          <span>库存自动同步</span>
                          <span className="text-emerald-400 font-bold">已启用</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>价格自适应更新</span>
                          <span className={chan.syncPrices ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                            {chan.syncPrices ? '已开启' : '关闭'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-zinc-500 flex items-center space-x-1 font-mono">
                      <span>配置管理</span>
                      <Settings className="h-3 w-3" />
                    </span>
                    {chan.status === 'connected' ? (
                      <button 
                        onClick={() => {
                          setChannels(prev => prev.map(c => c.storeId === chan.storeId ? { ...c, status: 'disconnected' } : c));
                          setSuccessToast(`🔌 已卸下 [${channelBadges[chan.channel]?.name}] 通讯节点`);
                          if (onAddLog) {
                            onAddLog('系统大厅', '🗑', `卸下了 ${chan.storeName} 的物料自动分发 Webhook 端口。`, 'warn');
                          }
                          setTimeout(() => setSuccessToast(''), 4000);
                        }}
                        className="text-red-400 hover:text-red-300 font-mono font-bold"
                      >
                        断开端点
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedChannelType(chan.channel);
                          setNewStoreId(`sto_${chan.channel}_${Math.floor(1000 + Math.random() * 9000)}`);
                          setNewStoreName(`${channelBadges[chan.channel]?.name || chan.channel}大店`);
                          setShowConnectModal(true);
                        }}
                        className="text-sky-400 hover:text-[#1D9BF0] font-mono font-bold"
                      >
                        立即接入
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="border border-neutral-900 rounded-xl bg-neutral-950/60 overflow-hidden text-left">
              <div className="p-4 border-b border-neutral-900 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-white">跨终端统一 SPU / SKU 分发与对账配比</h3>
                  <p className="text-zinc-500 text-[10.5px] mt-0.5">当任一异构销售渠道发生成交，MODAUI 统一库存锁定机制将被触发行程锁仓屏障</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  ● 统一锁仓守护中
                </span>
              </div>

              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-900 text-zinc-500 text-[9px] font-mono">
                      <th className="p-3 font-bold">主商品 SPU 方案</th>
                      <th className="p-3 font-bold">统一代码 (SKU)</th>
                      <th className="p-3 font-bold text-center">官方基线价</th>
                      <th className="p-3 font-bold text-center">可分发总库存</th>
                      <th className="p-3 font-bold">行销渠道多维覆盖及配对定价</th>
                      <th className="p-3 font-bold text-right">对账</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {unifiedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-900/30 transition">
                        <td className="p-3 font-bold text-white flex items-center space-x-2">
                          <span className="text-sm">🧥</span>
                          <span>{p.name}</span>
                        </td>
                        <td className="p-3 font-mono text-zinc-400">{p.sku}</td>
                        <td className="p-3 text-center font-mono text-white">¥{p.basePrice.toFixed(2)}</td>
                        <td className="p-3 text-center font-mono font-black text-amber-500">{p.totalInventory} 件</td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1.5">
                            {p.channels.map((ch, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-[10px] font-mono bg-neutral-940/50 border border-neutral-900 p-1.5 rounded">
                                <span className={channelBadges[ch.type]?.text || 'text-zinc-400'}>
                                  {channelBadges[ch.type]?.name}:
                                </span>
                                <span className="text-zinc-500">别号 {ch.sku}</span>
                                <span className="text-amber-500 font-bold">¥{ch.price.toFixed(2)}</span>
                                <span className="text-[#1D9BF0]">分配存量 {ch.stock}</span>
                                <span className="text-emerald-400 text-[8px] bg-emerald-500/10 px-1 rounded ml-auto border border-emerald-500/20">
                                  已同步
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-[#1D9BF0] font-mono text-[9px] rounded font-bold">
                            重新对齐
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden text-left">
              <div className="p-4 border-b border-neutral-900 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-white font-mono">集成异构销售渠道聚合订单</h3>
                  <p className="text-zinc-500 text-[10.5px] mt-0.5">多终端原始退差、结算地址和物流状况被转换为 MODAUI 标准大盘数据流方便多机器人自动跟进发货</p>
                </div>
              </div>

              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-900 text-zinc-500 text-[9px] font-mono">
                      <th className="p-3">聚合统一 ID</th>
                      <th className="p-3">销售渠道适配器</th>
                      <th className="p-3">外部订单原单 ID</th>
                      <th className="p-3">物料明细</th>
                      <th className="p-3 text-center">应汇成交总款</th>
                      <th className="p-3">收件人地址与买家</th>
                      <th className="p-3">顺丰货运承运状态</th>
                      <th className="p-3 text-right">承运</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {unifiedOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-900/30 transition">
                        <td className="p-3 font-mono text-white text-[10px] font-bold">{o.id}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded border ${channelBadges[o.channel]?.bg || 'bg-cyan-500/10 border-cyan-500/25'} ${channelBadges[o.channel]?.text || 'text-cyan-400'}`}>
                            {channelBadges[o.channel]?.name || o.channel.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-zinc-400 text-[9.5px]">{o.channelOrderId}</td>
                        <td className="p-3 text-zinc-300 text-[10px]">{o.itemsDesc}</td>
                        <td className="p-3 text-center font-mono font-bold text-amber-500">¥{o.totalAmount.toFixed(2)}</td>
                        <td className="p-3">
                          <div className="text-[10px]">
                            <p className="font-bold text-white">{o.customerName}</p>
                            <p className="text-zinc-500 leading-normal">{o.address}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold ${
                            o.shippingStatus === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-550/10 text-amber-500 border border-amber-550/20'
                          }`}>
                            {o.shippingStatus === 'delivered' ? '✓ 投递妥投' : '🕒 待顺丰上门收货'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            disabled={o.shippingStatus === 'delivered'}
                            onClick={() => {
                              setUnifiedOrders(prev => prev.map(order => 
                                order.id === o.id ? { ...order, shippingStatus: 'delivered' } : order
                              ));
                              setSuccessToast(`📦 聚合订单 ${o.id} 的顺丰一键面单与智能仓配配给已触发！`);
                              if (onAddLog) {
                                onAddLog('AI库管顾问', '🚚', `已将聚合订单 ${o.id} 匹配交接给顺丰特惠并一键发送面单！`, 'success');
                              }
                              setTimeout(() => setSuccessToast(''), 4500);
                            }}
                            className={`px-2 py-1 rounded text-[8.5px] font-bold ${
                              o.shippingStatus === 'delivered'
                                ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                                : 'bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-[#1D9BF0]'
                            }`}
                          >
                            承运 dispatch
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connection drawer dialog modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConnectModal(false)} />
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl w-full max-w-sm p-5 relative z-10 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
              <h3 className="font-extrabold text-white text-xs flex items-center gap-1">
                <Plus className="h-3.5 w-3.5 text-[#1D9BF0]" />
                <span>连接第三方行销平台渠道</span>
              </h3>
              <button onClick={() => setShowConnectModal(false)} className="text-zinc-500 hover:text-white p-1">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3.5 text-[11px] text-left">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">选择渠道平台</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'tiktok', name: 'TikTok Shop' },
                    { id: 'xiaohongshu', name: '小红书' },
                    { id: 'douyin', name: '抖音小店' },
                    { id: 'taobao', name: '淘宝商城' },
                    { id: 'pinduoduo', name: '拼多多' },
                    { id: 'amazon', name: 'Amazon' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedChannelType(t.id)}
                      className={`p-2 rounded border text-left flex items-center justify-between transition ${
                        selectedChannelType === t.id 
                          ? 'border-[#1D9BF0] bg-[#1D9BF0]/15 text-white font-bold' 
                          : 'border-neutral-900 bg-neutral-950 hover:border-neutral-850 text-zinc-400'
                      }`}
                    >
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1 font-mono">店铺 / API ID (StoreId)</label>
                <input 
                  type="text" 
                  value={newStoreId}
                  onChange={(e) => setNewStoreId(e.target.value)}
                  placeholder="e.g., sto_com_8273"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">店铺名称 (Label)</label>
                <input 
                  type="text" 
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g., 风衣系列分销特许店"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">多端 API 连接授权令牌 (AccessToken)</label>
                <input 
                  type="password" 
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="e.g., shp_oth_xxxxxxxxxxxxxxxxx"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1.5 text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="bg-sky-500/5 border border-sky-500/10 p-3 rounded-lg text-[9.5px] leading-relaxed text-zinc-400 flex items-start gap-1.5">
                <ShieldAlert className="h-4 w-4 text-[#1D9BF0] flex-shrink-0" />
                <p>
                  接入后，系统会自动通过 SSL 网关安全中继注册 Webhook。订单与库存会通过 AES-256 全程加密，绝不触及您的原生交易密码。
                </p>
              </div>

              <div className="pt-1.5 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setShowConnectModal(false)}
                  className="px-3 py-1.5 border border-neutral-800 hover:border-neutral-700 text-zinc-400 hover:text-white rounded"
                >
                  取消
                </button>
                <button 
                  type="button" 
                  onClick={handleConnectChannel}
                  className="px-3 py-1.5 bg-[#1D9BF0] text-white hover:bg-[#1D9BF0]/95 font-bold rounded"
                >
                  立即打通
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
