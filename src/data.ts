import { IndustryData, PricingPlan, OperatingStrategy } from './types';

export interface ProductPreset {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  desc: string;
  sales: number;
  rating: string;
  specs: {
    sizes: string[];
    labels: string;
  };
}

export interface IndustryPreset {
  company: string;
  headline: string;
  theme: 'retro' | 'dark' | 'classic';
  welcome: string;
  recommendation: string;
  agentName: string;
  agentDesc: string;
  agentEmoji: string;
  products: ProductPreset[];
}

export const INDUSTRIES: IndustryData[] = [
  {
    id: 'fashion',
    name: '服装公司',
    emoji: '👗',
    tagline: '引领潮流款式设计，打样快反供应，社交裂变营销。',
    bgColor: 'from-amber-950/20 to-neutral-950',
    team: [
      {
        role: 'AI设计师 Aria',
        emoji: '🎨',
        name: 'Aria',
        desc: '趋势监控与款式设计，微店高精3D样装视觉开发。',
        status: 'active',
        tasks: ['分析本周TikTok潮流趋势', '设计秋季新品风衣线草图', '生成3D样衣渲染图']
      },
      {
        role: 'AI选品经理 Barton',
        emoji: '🎒',
        name: 'Barton',
        desc: '细分热度分析与竞品走势熔断、SPU自动分类上架。',
        status: 'active',
        tasks: ['分析欧美时尚KOL穿搭高频热词', '优化服装测品打样选定比例', '监测拼多多百亿补贴同款竞品']
      },
      {
        role: 'AI运营经理 Cyrus',
        emoji: '📈',
        name: 'Cyrus',
        desc: '柔性供应链配货安排，顺丰一单代揽，发货异常拦截。',
        status: 'active',
        tasks: ['检测高腰直筒裤库存红线', '生成服装上架SKU排单表', '评估拼多多店群活动回本周期']
      },
      {
        role: 'AI营销经理 Daphne',
        emoji: '📣',
        name: 'Daphne',
        desc: '输出小红书穿搭推荐文及批量派样KOL。',
        status: 'active',
        tasks: ['生成小红书法式复古风穿搭笔记', '筛选万粉潮流博主建联推荐', '分析今日直通车推广ROI']
      },
      {
        role: 'AI财务主管 Fiona',
        emoji: '🧮',
        name: 'Fiona',
        desc: 'Stripe/微信资金一键核销、算力消耗与API账套精整。',
        status: 'active',
        tasks: ['扣除代发代扣成本进行财务复核', '算力消耗对账核算', '导出每日销售状况和利润率']
      },
      {
        role: 'AI客服主管 Claire',
        emoji: '💬',
        name: 'Claire',
        desc: '24h全天候售后接待与高情商自动阻退解决。',
        status: 'active',
        tasks: ['尺码纠纷对答', '顺丰中转阻退机制', '安抚高情商差评转化']
      }
    ]
  },
  {
    id: 'catering',
    name: '餐饮公司',
    emoji: '🍜',
    tagline: '打造餐饮爆品配方，智慧外卖配送券，一句话大促Banner生成。',
    bgColor: 'from-orange-950/20 to-neutral-950',
    team: [
      {
        role: 'AI菜单顾问 Kai',
        emoji: '🍽️',
        name: 'Kai',
        desc: '店面网店装潢、美团饿了么Banner热卖视觉拼图排板。',
        status: 'active',
        tasks: ['菜单门牌陈列', '美食图片生成', 'VI营销排板']
      },
      {
        role: 'AI采购经理 Ren',
        emoji: '🍜',
        name: 'Ren',
        desc: '美食配方库升级、食材大仓采购进销单倒挂核算。',
        status: 'active',
        tasks: ['对比美白菜/青椒批发价', '自动计算明日猪肉进货需求量', '核算新供销社运费与履约率']
      },
      {
        role: 'AI运营经理 Lulu',
        emoji: '📈',
        name: 'Lulu',
        desc: '自动呼叫顺丰跑腿，洒漏突发核定退赔，多店订单流水对账。',
        status: 'active',
        tasks: ['核实外卖平台服务费自动对账', '友好拦截并快速安抚起因洒漏退折', '核对支付宝与微信结算账户余额']
      },
      {
        role: 'AI营销经理 Soren',
        emoji: '📣',
        name: 'Soren',
        desc: '神券预算精整折算，朋友圈爆款霸王餐派发策略。',
        status: 'active',
        tasks: ['精算满返神券营销梯度', '筹划小红书地方夜宵卡博主霸王餐', '回购社群全域宣发']
      },
      {
        role: 'AI财务主管 Ken',
        emoji: '💰',
        name: 'Ken',
        desc: '门店平台扣点对账核销，毛利防跌安全。',
        status: 'active',
        tasks: ['自动外卖平台流水勾兑', '大仓采购物耗统计', '单店每日扣耗计算']
      },
      {
        role: 'AI客服主管 Mia',
        emoji: '📞',
        name: 'Mia',
        desc: '极速延误主动安抚、洒漏先行垫付赔付、专属神券回馈。',
        status: 'active',
        tasks: ['延误客群专属券推送', '出餐危机调平解释', '差评回访百分百转化']
      }
    ]
  },
  {
    id: 'retail',
    name: '百货零售',
    emoji: '🏪',
    tagline: '跨境百货好物精选开发，多规格自动分类定价与保价。',
    bgColor: 'from-emerald-950/20 to-neutral-950',
    team: [
      {
        role: 'AI选品顾问 Dax',
        emoji: '🏪',
        name: 'Dax',
        desc: '全球日用爆品热度筛选，一件换色调音及陈列。',
        status: 'active',
        tasks: ['筛查亚马逊近7天飙升日用百货', '提取“解压重力玩具”好评卖点', '测算国内多渠道拿货毛利差值']
      },
      {
        role: 'AI采购经理 Barton',
        emoji: '🎒',
        name: 'Barton',
        desc: '对接源头优质发货商，保价险套配计算，自动发件。',
        status: 'active',
        tasks: ['匹配3家义乌源头雨伞代加工厂', '自动化核验发货物流准时率', '设定自动采购跟单提醒机制']
      },
      {
        role: 'AI运营经理 Cyrus',
        emoji: '📈',
        name: 'Cyrus',
        desc: '多渠道详情一键发布，拼单自动合流顺丰并海外跟单。',
        status: 'active',
        tasks: ['自锁多网店同库存步合账', '核对手续折算返佣', '监控运损索赔机制']
      },
      {
        role: 'AI营销经理 Nova',
        emoji: '📣',
        name: 'Nova',
        desc: '谷歌限时折扣，千次展现直通车智能防爆出价。',
        status: 'active',
        tasks: ['生成创意收纳挂包挂载车投文案', '配置每日50元起步低成本测品计划', '调整直通车千次展现成本出价']
      },
      {
        role: 'AI财务主管 Henry',
        emoji: '🏦',
        name: 'Henry',
        desc: '跨境多币种结算、VAT账目核收审计与损溢表。',
        status: 'active',
        tasks: ['多币种金流折算', '年季损益折抵核算', '物流计泡审计扣抵']
      },
      {
        role: 'AI客服主管 Holly',
        emoji: '🗣️',
        name: 'Holly',
        desc: '丢件秒级回单重发，多语种极速产品参数答疑。',
        status: 'active',
        tasks: ['海派参数英文对答', '物流丢件专席补寄', '运损自动安抚阻退']
      }
    ]
  },
  {
    id: 'beauty',
    name: '美业公司',
    emoji: '💄',
    tagline: '美容私域拓客美学，储值高倍赠券，抗敏感安全高能接待。',
    bgColor: 'from-pink-950/20 to-neutral-950',
    team: [
      {
        role: 'AI产品顾问 Amber',
        emoji: '💄',
        name: 'Amber',
        desc: 'VIP团购精致卡面排板、节假SPA舒享视觉宣传绘卷。',
        status: 'active',
        tasks: ['检索小红书“积雪草修护”热度数据', '完成新款紧致抗皱乳霜的概念画稿', '校对新款明星单品安全申报材料']
      },
      {
        role: 'AI会员运营经理 Bella',
        emoji: '🧪',
        name: 'Bella',
        desc: '精油多肽原液耗材大红线预警，客群活跃度留存精算。',
        status: 'active',
        tasks: ['私域发券提升客来率', 'VIP大客户长周期分析', '敏感客群成分排异清单']
      },
      {
        role: 'AI运营经理 Cherry',
        emoji: '📈',
        name: 'Cherry',
        desc: '秒速核销美团抖音美业券，敏感退赔即刻审核。',
        status: 'active',
        tasks: ['多预约周六下午面排班', '合并微信与美团入账结算', '确认并自动审核客赔']
      },
      {
        role: 'AI营销经理 Dora',
        emoji: '📣',
        name: 'Dora',
        desc: '“闺蜜同行”本地团购文案撰写，KOL千人试样招募。',
        status: 'active',
        tasks: ['撰写私域裂变引流博文', '口红派样达人接单监控', '出厂大促福利裂变策划']
      },
      {
        role: 'AI财务主管 David',
        emoji: '💸',
        name: 'David',
        desc: '美业卡项提成精算，资金沉淀和流水分成清点。',
        status: 'active',
        tasks: ['储值卡金流结算', '高提成比例防穿透校准', '全店大客月度财报分析']
      },
      {
        role: 'AI客服主管 Coco',
        emoji: '💁‍♀️',
        name: 'Coco',
        desc: '24h美容红敏急客退赔对答，二次预约便捷调平。',
        status: 'active',
        tasks: ['红敏秒速专属津贴赔付', '高级护理保养细节解惑', '预约冲突无缝重改']
      }
    ]
  },
  {
    id: 'fitness',
    name: '健身公司',
    emoji: '🏋️',
    tagline: '定制健身课谱，卡路里轻食营养沙拉，社群打卡与卡项调平。',
    bgColor: 'from-purple-950/20 to-neutral-950',
    team: [
      {
        role: 'AI课程顾问 Bruce',
        emoji: '🏋️',
        name: 'Bruce',
        desc: '高清挑战打卡海报、生酮低碳课谱拼装、周度特训视觉。',
        status: 'active',
        tasks: ['排课多场景视觉生成', '挑战逆袭海报拼装', '营运周期海报']
      },
      {
        role: 'AI会员运营经理 Jane',
        emoji: '🥗',
        name: 'Jane',
        desc: '沙拉零售高能膳食配比，即送冷链供应控制。',
        status: 'active',
        tasks: ['零售轻食SPU打标', '配餐卡量对账折抵', '对接顺丰高效配送']
      },
      {
        role: 'AI运营经理 Kevin',
        emoji: '📈',
        name: 'Kevin',
        desc: '团卡到店率大漏点封堵，社群24h打卡记录，请假快捷扣减。',
        status: 'active',
        tasks: ['合并预约队列防爆排表', '审核客户秒请假批准', '对账提现']
      },
      {
        role: 'AI营销经理 Cindy',
        emoji: '📣',
        name: 'Cindy',
        desc: '微信「百日逆袭」宣传裂变推广，抖音轻食预热方案。',
        status: 'active',
        tasks: ['热销健身挑战推文', '粉丝高额福利裂变券配置', '自发文排程']
      },
      {
        role: 'AI财务主管 Frank',
        emoji: '📅',
        name: 'Frank',
        desc: '年卡卡金摊销结算，多店毛利比对分析。',
        status: 'active',
        tasks: ['计提月摊销营收', '教练提成结算', '大促销售曲线总结']
      },
      {
        role: 'AI客服主管 Kelly',
        emoji: '🗣️',
        name: 'Kelly',
        desc: '教练派配冲突秒调，无忧卡项展期高情商处理。',
        status: 'active',
        tasks: ['私教调课高优对接', '请假超出额度高情商解释', '差评一秒安抚转化']
      }
    ]
  },
  {
    id: 'jewelry',
    name: '珠宝公司',
    emoji: '💎',
    tagline: '大师奢品首饰3D开发，每日实时克黄金变价，顺丰航空护航核款。',
    bgColor: 'from-amber-900/25 to-neutral-950',
    team: [
      {
        role: 'AI产品设计师 Chloe',
        emoji: '💎',
        name: 'Chloe',
        desc: '工艺哑光拉丝细节网页，高奢贵气官旗渲染绘版。',
        status: 'active',
        tasks: ['裸钻3D折射建模效果', '高定首饰视觉提料', '一证一质检证书排板']
      },
      {
        role: 'AI采购经理 Rex',
        emoji: '💍',
        name: 'Rex',
        desc: '绑定上海大亨基准，时时自动更新黄金每克变重售价。',
        status: 'active',
        tasks: ['大盘克重定价倒推', '一证一验配对录单', '大买家核单准备']
      },
      {
        role: 'AI运营经理 Vance',
        emoji: '📈',
        name: 'Vance',
        desc: '顺丰大额报价封签，高值客诉一对一安全赔付理。',
        status: 'active',
        tasks: ['顺丰高保价专班跟单', '金流汇入极速二次确认', '极快配供出厂排单']
      },
      {
        role: 'AI营销经理 Jewel',
        emoji: '📣',
        name: 'Jewel',
        desc: '「中泰金饰奢华溯源」文，新人婚礼珠宝专项代金发券。',
        status: 'active',
        tasks: ['撰写贵气古法金故事', '限时高客单大券折抵配准', '高端引智博主推荐']
      },
      {
        role: 'AI财务主管 Jeff',
        emoji: '⚖️',
        name: 'Jeff',
        desc: '金价频繁波动对冲大盘精算，大笔金料账目比对审计。',
        status: 'active',
        tasks: ['大笔贵重物资进销记存', '出证手续损溢扣核', '季年终金仓清点报导']
      },
      {
        role: 'AI客服主管 Joy',
        emoji: '🤵',
        name: 'Joy',
        desc: '专席优雅护金礼，极密物流保值理赔核对。',
        status: 'active',
        tasks: ['足金养护细节对答', '保价丢损官方理赔跟单', '预约私享一对一通']
      }
    ]
  },
  {
    id: 'home',
    name: '家居公司',
    emoji: '🛋️',
    tagline: '空间美学选品，零配件大件专线运输，破损速先行补。',
    bgColor: 'from-orange-950/20 to-neutral-950',
    team: [
      {
        role: 'AI选品顾问 Dax',
        emoji: '🛋️',
        name: 'Dax',
        desc: '整卧风格场景图开发，环保证书可视化宣传册。',
        status: 'active',
        tasks: ['3D空间搭配陈列', '多维色彩质感排色', '环保级板材详情设计']
      },
      {
        role: 'AI采购经理 Logan',
        emoji: '🪵',
        name: 'Logan',
        desc: '纯橡皮实木与精雕五金源头配货，出大件集仓打包。',
        status: 'active',
        tasks: ['主卧环保源头采买', '大件拼柜限重计算', '配件合规账录']
      },
      {
        role: 'AI运营经理 Kyle',
        emoji: '🚚',
        name: 'Kyle',
        desc: '专线超载大件比运托，破损一秒补调，配送大红线预警。',
        status: 'active',
        tasks: ['物流托运报价比账', '核实先行免费补发配件', '物流发件时效催收']
      },
      {
        role: 'AI营销经理 Nova',
        emoji: '📢',
        name: 'Nova',
        desc: '「侘寂风格软装拼购」推广，家居百博主连，包邮送。',
        status: 'active',
        tasks: ['风格种草文案', '大件特惠拼装', '博主家居测评']
      },
      {
        role: 'AI财务主管 Henry',
        emoji: '💳',
        name: 'Henry',
        desc: '大件体积重费对账折，大客户退款高值损益控制。',
        status: 'active',
        tasks: ['物流计泡费结对账', '供应商月账款折支', '全店大客月度财报分析']
      },
      {
        role: 'AI客服主管 Holly',
        emoji: '📐',
        name: 'Holly',
        desc: '家具上楼安排对，极速丢配补寄，尺寸错误阻款。',
        status: 'active',
        tasks: ['大件家具送货上门安排反馈', '破损零配件补寄对接', '高货损极力纠纷阻退']
      }
    ]
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: '基础版',
    price: '¥ 99',
    period: '月',
    desc: '适合个人与小微起步',
    features: [
      '授权 1 家虚拟公司',
      '配备 2 名 AI 员工',
      '7x24 小时自主工作',
      '支持一件代发与监控',
      '标准财务账单导出'
    ]
  },
  {
    id: 'standard',
    name: '标准版',
    price: '¥ 299',
    period: '月',
    desc: '配备整套完整团队',
    features: [
      '授权 3 家虚拟公司',
      '配备 4 名全能员工',
      '社群营销与自动推送',
      '高级策略智能调控',
      '提供实时销量分析'
    ]
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: '¥ 899',
    period: '月',
    desc: '多品牌集团覆盖运营',
    features: [
      '授权无限家虚拟公司',
      '配备无限位特训员工',
      '独占服务器极速响应',
      '专家模型定制服务',
      '高精物理安全隔离'
    ]
  }
];

export const OPERATING_STRATEGIES: OperatingStrategy[] = [
  {
    id: 'lean',
    name: '精益创业模式',
    tag: '敏捷自适应',
    desc: '精益思维 严控成本',
    intensity: 'low'
  },
  {
    id: 'expansion',
    name: '稳健扩张模式',
    tag: '数据驱动型',
    desc: '稳健测品 智能投流',
    intensity: 'medium'
  },
  {
    id: 'autopilot',
    name: '全权代理模式',
    tag: '智能体托管',
    desc: '完全托管 自动套利',
    intensity: 'high'
  }
];

export const MOCK_LOGS_POOL: Record<string, string[]> = {
  fashion_design: [
    '👗 AI设计师 Aria 发现 TikTok 上 #frenchcottage 话题播放量环比暴增 120%',
    '👗 AI设计师 Aria 已基于积雪草复古色系设计出 3 款夏末长袖风衣，像素渲染已就绪',
    '👗 AI设计师 Aria 顺利上传 3D 服饰模型，完成首批虚拟模特身着效果图，开始进行货品尺码打版'
  ],
  fashion_procure: [
    '📦 AI选品经理 Barton 筛选服装测品打样选定比例，监控同款竞品走势',
    '📦 AI选品经理 Barton 跟踪最新进价水平，与一手打板面料厂达成一件代发样衣直供协议',
    '📦 AI选品经理 Barton 支付首笔样板布费，原料已由顺丰承运，预计明早 9 点抵达车间'
  ],
  fashion_operate: [
    '📈 AI运营经理 Cyrus 检测到高腰直筒裤销量突破 80 件，首单库存已消耗 85%，自动启动柔性快反补货计划',
    '📈 AI运营经理 Cyrus 完成商品多渠道详情页一键上架，已同步排布商品在各大电商平台的展现位',
    '📈 AI运营经理 Cyrus 把控面料和制衣进度，自动分配并校对排单单号'
  ],
  billing: [
    '💰 财务审计 汇总今日完成交易额，今日业务实现高比例利润溢价，单日净利率表现稳健',
    '💰 财务审计 完成微信支付/支付宝流水账户 of 对账复核，排除多起重复退款申请',
    '💰 财务审计 已生成今日的成本账单与销售曲线，提交至主控制台'
  ],
  support: [
    '💬 运营窗口 在线极速接待客户咨询，顾客精细化说服，顾客在 3 秒后痛快付款购买',
    '💬 运营窗口 成功拦截 1 件处于揽收异常状态的物流，并在线主动向买家赠予 3 元延迟津贴',
    '💬 运营窗口 在线极速调停破损货损申请，退还 2 元折旧补贴，换取五星好评'
  ]
};

export const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  fashion: {
    company: 'Aria Fashion Studio',
    headline: '👗 Aria 季风高定系列 · 舒感美学新风尚',
    theme: 'classic',
    welcome: '您好！我是 Claire，您的 24 小时 AI 穿搭与服饰顾问。真实尺码不合、重货快反配发、潮流搭配，随时问我哦！👗',
    recommendation: 'Aria 精选季风穿搭新款碎花长裙搭配流苏开衫外套',
    agentName: 'Claire',
    agentDesc: 'AI 经典穿搭服饰客服主管',
    agentEmoji: '💬',
    products: [
      { id: 'f1', name: '季风碎花垂坠长裙', price: 399, stock: 45, image: '👗', category: '女装', desc: '经典优雅，高腰版型，展现浪漫法式度假感，纯真丝爽滑内里。', sales: 412, rating: '99%', specs: { sizes: ['S码', 'M码', 'L码'], labels: '标准版/加长版' } },
      { id: 'f2', name: '舒感全棉针织吊带', price: 129, stock: 120, image: '👚', category: '女装', desc: '100%有机长绒棉，贴身舒适回弹，不易起球，多色百搭。', sales: 1240, rating: '98%', specs: { sizes: ['均码 / 白色', '均码 / 灰色', '均码 / 黑色'], labels: '修身版/宽松版' } },
      { id: 'f3', name: '桑蚕丝缎面修身西装', price: 899, stock: 30, image: '🧥', category: '外套', desc: '精选桑蚕丝混纺挺阔面料，手感高级莹润，利落剪裁。', sales: 98, rating: '97%', specs: { sizes: ['S码', 'M码', 'L码'], labels: '修身一粒扣' } },
      { id: 'f4', name: '收腹塑形高腰瑜伽裤', price: 199, stock: 85, image: '👖', category: '运动', desc: '双重高密弹力空气层，裸感雕琢腰腹线条，轻凉防震。', sales: 310, rating: '96%', specs: { sizes: ['S码', 'M码', 'L码', 'XL码'], labels: '高腰提臀版' } }
    ]
  },
  catering: {
    company: 'Tyson Cafe',
    headline: '☕ Tyson Cafe · 经典美式/手作拿铁特惠',
    theme: 'retro',
    welcome: '您好！我是 Mia，欢迎光临美食小站！对我们的招牌推荐、特惠满减券或者送达时效有什么疑问吗？立即帮您解答！🍛',
    recommendation: 'Mia 臻选深烘椰香拿铁配手工熔岩黑森林慕斯',
    agentName: 'Mia',
    agentDesc: 'AI 餐饮外卖关怀客服主管',
    agentEmoji: '📞',
    products: [
      { id: 'p1', name: '豪华原味冰美式', price: 18, stock: 120, image: '🥤', category: '咖啡', desc: '清爽顺滑，经典之选，100%阿拉比卡咖啡豆。', sales: 1234, rating: '98%', specs: { sizes: ['中杯 ¥18', '大杯 ¥22'], labels: '标准/少冰' } },
      { id: 'p2', name: '经典丝滑热拿铁', price: 28, stock: 85, image: '☕', category: '咖啡', desc: '经典比例，奶香浓郁，自然甘甜，丝滑口感。', sales: 889, rating: '97%', specs: { sizes: ['中杯 ¥28', '大杯 ¥32'], labels: '标准/多奶' } },
      { id: 'p3', name: '招牌厚生椰拿铁', price: 28, stock: 140, image: '🥥', category: '咖啡', desc: '椰香浓郁，口感顺滑，香甜醇厚，一口惊艳。', sales: 1109, rating: '99%', specs: { sizes: ['中杯 ¥28', '大杯 ¥32'], labels: '推荐冰饮' } },
      { id: 'p6', name: '意式浓巧提拉米苏', price: 26, stock: 40, image: '🍰', category: '甜品', desc: '意式经典重现，马斯卡彭慕斯搭配咖啡酒味，回味悠长。', sales: 310, rating: '96%', specs: { sizes: ['标准切片'], labels: '配热咖啡' } }
    ]
  },
  retail: {
    company: 'Moda Global Direct',
    headline: '✈️ 全球尖货精选直邮 · 发现品质生活好物',
    theme: 'classic',
    welcome: 'Hello！我是 Holly，生活百货采购及物流管家。货运发运详情、多规格对账、真实质保保真，均可一秒解答！✈️',
    recommendation: 'Holly 甄选便携式高强度真空保温杯与极速空气炸锅组',
    agentName: 'Holly',
    agentDesc: 'AI 跨境好物客服主管',
    agentEmoji: '🗣️',
    products: [
      { id: 'r1', name: '真空不锈钢保温杯', price: 129, stock: 88, image: '🥛', category: '餐具', desc: '镜面抽真空高规不锈钢，超强保冷防漏，24小时保温。', sales: 620, rating: '98%', specs: { sizes: ['350ml', '500ml'], labels: '曜石黑/皓月白' } },
      { id: 'r2', name: '智能防粘空气炸锅', price: 388, stock: 40, image: '🍳', category: '电器', desc: '360°热风循环极速脆化，免除繁多油脂，不粘易拆洗。', sales: 315, rating: '99%', specs: { sizes: ['4.5L 经典款', '6L 尊享家庭款'], labels: '一键智能屏' } },
      { id: 'r3', name: '按摩气垫发梳', price: 89, stock: 110, image: '🪮', category: '个护', desc: '活性透气气垫，防止拉拉掉发，轻按头部穴位奢华体验。', sales: 124, rating: '95%', specs: { sizes: ['气囊按摩款', '防静电木齿款'], labels: '天然原木柄' } },
      { id: 'r4', name: '无叶降温挂脖风扇', price: 59, stock: 150, image: '🌀', category: '百货', desc: '双侧强力直流电机不吹发，全时柔风，环抱式清凉。', sales: 450, rating: '97%', specs: { sizes: ['标准款', '10小时长续航款'], labels: '风道防缠发' } }
    ]
  },
  beauty: {
    company: 'Coco Beauty Salon',
    headline: '💄 Coco Salon · 焕活平衡 SPA 与定制深层理疗',
    theme: 'classic',
    welcome: '欢迎来到佳人奢护沙龙！我是 Coco，对我们的实名预约变更、私域团购专属特惠卡有什么想了解的吗？💄',
    recommendation: 'Coco 极力特推焕活平衡 SPA 专属紧致精油深层疗程',
    agentName: 'Coco',
    agentDesc: 'AI 美容私域特惠客服主管',
    agentEmoji: '💁‍♀️',
    products: [
      { id: 'b1', name: '焕活全身精油SPA', price: 398, stock: 20, image: '🧴', category: 'SPA', desc: '独家精油按摩调理，通调身心气血，驱除肌肉深度疲累与僵硬。', sales: 88, rating: '99%', specs: { sizes: ['单人/60分钟', '单人/90分钟尊享'], labels: '到店即享/提供简餐' } },
      { id: 'b2', name: '无痕轻柔睫毛嫁接', price: 168, stock: 45, image: '👁️', category: '美睫', desc: '进口材质无重力柔滑嫁接，防敏不流泪，持久卷挺定型。', sales: 240, rating: '97%', specs: { sizes: ['自然款/120根', '浓密尊享不限根数'], labels: '专业技师一对一' } },
      { id: 'b3', name: '修护胶原蛋白面膜组', price: 258, stock: 75, image: '💆‍♀️', category: '护肤', desc: '冷敷多肽原液深层吸收，针对敏感换季红疹极速舒缓焕新。', sales: 185, rating: '98%', specs: { sizes: ['5片疗程体验装', '15片密集修复囤货装'], labels: '敏感肌可用' } },
      { id: 'b4', name: '头道舒压毛囊净化养护', price: 128, stock: 50, image: '🧼', category: '沙龙', desc: '控油研磨净化颗粒，深层舒缓长期劳累头痛与紧绷。', sales: 310, rating: '96%', specs: { sizes: ['标准体验/40分钟'], labels: '附赠肩颈推拿' } }
    ]
  },
  fitness: {
    company: 'Kelly Fitness Center',
    headline: '🏋️ Kelly Gym · 尊享周度私教定制与低碳膳食',
    theme: 'dark',
    welcome: 'Hey！我是 Kelly，您的健身课程与轻食配餐顾问。需要请假延期、调整课表或是营养餐谱吗？立即帮您排好！🏋️',
    recommendation: 'Kelly 专配高蛋白减脂沙拉组合与周度打卡尊享私家特训',
    agentName: 'Kelly',
    agentDesc: 'AI 健身低碳塑形客服主管',
    agentEmoji: '👟',
    products: [
      { id: 't1', name: '全身力量雕刻一对一课', price: 265, stock: 35, image: '🏋️', category: '私教', desc: '一对一量身定制动作，激活深层肌群，高效燃脂。', sales: 110, rating: '100%', specs: { sizes: ['单节1对1私教课', '10节体能蜕变预售卡'], labels: '国家认证教练授课' } },
      { id: 't2', name: '控卡蛋白纤虾沙拉餐', price: 45, stock: 80, image: '🥗', category: '轻食', desc: '新鲜水熟基围虾配牛油果、羽衣甘蓝，满足高质增肌。', sales: 350, rating: '98%', specs: { sizes: ['标准单人份', '双倍虾仁减脂套餐'], labels: '下单现做30分达' } },
      { id: 't3', name: '防震高弹速干运动背心', price: 178, stock: 65, image: '👚', category: '装备', desc: '吸湿排汗四面弹，防止剧烈震晃，美背肩带舒爽。', sales: 125, rating: '97%', specs: { sizes: ['S码', 'M码', 'L码'], labels: '经典雾霾蓝/高冷雅黑' } },
      { id: 't4', name: '防滑降噪回弹瑜伽发汗垫', price: 128, stock: 90, image: '🧘', category: '装备', desc: '加宽加厚TPE复合防裂，双面锁滑减震，全向呵护膝肘。', sales: 240, rating: '96%', specs: { sizes: ['183cm宽屏标准版', '185cm加厚资深款'], labels: '赠送原装绑带+背袋' } }
    ]
  },
  jewelry: {
    company: 'Joy High Jewelry',
    headline: '💎 18K足金古法拉丝龙凤金镯 · 匠人高定传承',
    theme: 'retro',
    welcome: '尊贵的贵宾您好，我是 Joy，您的专属珠宝保真礼宾。我可以为您解答一证一质检证书、实时金价变动、顺丰专机高保价包邮等细节。💎',
    recommendation: 'Joy 鉴选足金古法拉丝龙凤金镯一证一码质检护航套',
    agentName: 'Joy',
    agentDesc: 'AI 高端奢品保真客服主管',
    agentEmoji: '🤵',
    products: [
      { id: 'j1', name: '传承古法手工拉丝龙凤金手镯', price: 5900, stock: 15, image: '💍', category: '古法金奢', desc: '足金重器，古法哑光拉丝工艺，纯工匠龙凤浮雕，富贵典雅。', sales: 24, rating: '100%', specs: { sizes: ['18克贵妃轻盈款', '24克高定祥瑞宽版'], labels: '带国家质检证一证一码' } },
      { id: 'j2', name: '温润和田白玉平安吊坠', price: 1880, stock: 25, image: '📿', category: '和田白玉', desc: '精挑高白油亮和田玉，手工双面俏雕，玉质细腻莹润温和。', sales: 48, rating: '99%', specs: { sizes: ['精磨水滴款', '圆融平安扣型'], labels: '附赠手工红绳包装盒' } },
      { id: 'j3', name: '公主六爪高定钻戒', price: 12900, stock: 8, image: '💎', category: '钻戒誓约', desc: '璀璨八心八箭切面，极致无暇切工，GIA身份保真承诺。', sales: 12, rating: '100%', specs: { sizes: ['30分精品日常款', '50分璀璨求婚星光款'], labels: '一证一码' } },
      { id: 'j4', name: '天然极光海水珍珠耳环一对', price: 3600, stock: 20, image: '👂', category: '耳饰高定', desc: '金属质感强偏红极光，18K金耳轮佩戴极为典雅，尊显气场。', sales: 75, rating: '98%', specs: { sizes: ['7mm 精品一对', '8.5mm 豪奢一对'], labels: '无暇镜面极光' } }
    ]
  },
  home: {
    company: 'Holly Home Aesthetics',
    headline: '🛋️ 空间美学 · 环保级棉麻主卧全套风格软装',
    theme: 'classic',
    welcome: '您好！我是 Holly，负责您的重货美学托运与空间软装排单。需要查询专线大件上楼服务或零配件寄发，由我快速安全受理！🛋️',
    recommendation: 'Holly 精配现代极简环保级棉麻主卧全套风格整体软装',
    agentName: 'Holly',
    agentDesc: 'AI 空间美学软装客服主管',
    agentEmoji: '📐',
    products: [
      { id: 'h1', name: '高回弹太空棉科技科技布沙发', price: 3800, stock: 12, image: '🛋️', category: '家具', desc: '高回弹多段托护，特种布防水防污耐磨防爪，质感轻奢。', sales: 30, rating: '99%', specs: { sizes: ['双人舒适 1.8米', '三人宽奢 2.4米'], labels: '极速大件直配上楼安装' } },
      { id: 'h2', name: '北美白橡木实质感直条桌餐椅', price: 1200, stock: 18, image: '🪑', category: '家具', desc: '精选白橡木防霉，无棱角防撞，零挥发清乳环保无味。', sales: 55, rating: '98%', specs: { sizes: ['一桌四椅基础组合', '一桌六椅升级套系'], labels: '资深师傅上门免费安装' } },
      { id: 'h3', name: '加厚物理隔冷防挥发隔音窗帘', price: 680, stock: 40, image: '🪵', category: '软装', desc: '高密度隔热物理降噪，挂纱免熨，无挥发甲醛，安全抗静电。', sales: 110, rating: '97%', specs: { sizes: ['高2.7米 窗宽3米/挂钩款', '高2.7米 窗宽4米/打孔款'], labels: '免加工辅料费' } },
      { id: 'h4', name: '仿生记忆慢弯释压护颈椎枕', price: 249, stock: 85, image: '🛏️', category: '寝具', desc: '科学人体曲面护颈，平躺侧卧一秒护椎，深层安享舒适熟睡。', sales: 410, rating: '98%', specs: { sizes: ['慢回弹舒睡经典一个', '家庭专享实惠两只装'], labels: 'A类亲肤防螨枕套' } }
    ]
  }
};
