import { Coach, Achievement, StudyStats, LessonCard, IngestedDoc, UserProfile } from "./types";

export const initialProfile: UserProfile = {
  name: "Alex",
  role: "Export Sales Manager",
  industry: "Electronics Manufacturing",
  product: "Industrial Components",
  market: "Europe and North America",
  learningGoal: "Customer negotiation and technical presentations",
};

export const initialStats: StudyStats = {
  xp: 4250,
  studyTimeMinutes: 225, // 3h 45m
  todayMinutes: 15,
  dailyGoalMinutes: 30,
  lessonsCompleted: 12,
  accuracy: 92,
  streak: 12,
};

export const initialCoaches: Coach[] = [
  {
    id: "klaus",
    name: "Klaus Müller",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBriMDHPd4QXdWuoX0cB5iQOBLITUddfHZruJvJFdo5xObnUn69z0ZgDcsgvNQzCfSXZspoPuRd_nfbQqLlW8Wa1lwaKzJRfwYnGIJNGQ1xdCEK7hty75WeqceBt3Nf9tH7PQZ_WooRbmi1QKKwcSkrkafG32pEYSTF3QSLHpejcEyj71k-N_2kXKWIwPuOtDC9_wyJV2PcJ7rJtcGdAmjnlDL5kljsvqcqyFwGZzyx7O2cs8_NEAOD9qipf3YUtv677iePtiN8v3M",
    description: "German Customer • Hard",
    tags: ["Negotiation", "Direct"],
    difficulty: "Hard",
  },
  {
    id: "sarah",
    name: "Sarah Jenkins",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIjOM9UtxzjQwvDJCVU10V0i0gnzQXj8Z1_-ePCZFsqjanp3xGZF5ZB--XhbrnHbxRUWiMWn5Snl0hUELxTNAKufUzjEbdyxpYFnP4cyW0q_G1iVrR1z47YpXYbw8axNDZPFcnBZ4UHBUVuX-JDFALi6FZMVqebuKQVlgxJyAXBDiMzLILqhScaJyxxje3n4PPuHnST9ciD7JKUjn_5KOx64q97OOHGUc6jMC8vvOIDpGrGz5wOkGrWSL78f9BFNOYSOz02f6gNrY",
    description: "US Purchasing Mgr • Medium",
    tags: ["Small Talk", "Persuasion"],
    difficulty: "Medium",
  },
];

export const initialAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "Grammar Master: Conditional",
    subtitle: "Scored 100% on Advanced Conditionals",
    icon: "military_tech",
    date: "2d ago",
    fill: true,
  },
  {
    id: "ach-2",
    title: "Vocabulary Expansion",
    subtitle: "Learned 50 new industry terms",
    icon: "psychology",
    date: "1w ago",
    fill: true,
  },
];

export const initialLessonCards: LessonCard[] = [
  {
    id: "lesson-1",
    title: "Negotiating Terms for Electronics",
    category: "Business",
    description: "Master essential vocabulary and polite persistence strategies for high-stakes vendor negotiations.",
    time: "15 min",
    level: "Advanced",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoy9xBau8pyO5H-HKAYciD5Fi63NhwcEnhP0Rn98oRalQLeKws9h-rrl_2hPFyvGKPoG2CxSnC4TGdkPzRShqldWMg4VgWnSmu7F2POnG-rpJQZfM0ppnXYvWRmkidj0w61yv1T_jGoUu2aq-2nKjJqJ1-Jbd9LESLSrMizs6wqzs84JgqovTUCh89ld19Xj8V-GphKI5YpaymVUcgC2qSTObovI1Y6f-rjTDGMRP2RZ0bUxfv_Ltxt5dagdVyx7Xn3VqQ7Lhq_fc",
    fullDefinition: "The total time elapsed between the initiation of a process or project and its completion. In supply chain context, it typically refers to the time between placing an order and receiving the goods.",
    fullDefinitionCn: "从流程或项目启动到最终完成所经历的总时间。在供应链中，通常指从下单到收到货物之间的时间。",
    phonetic: "/liːd taɪm/",
    tag1: "Supply Chain Management",
    tag2: "Lead Time",
    scenarios: [
      {
        type: "Formal Email",
        icon: "mail",
        title: "Formal Email",
        english: "Could you please confirm the expected lead time for this component?",
        translation: "您能确认一下这个零部件的预计交期吗？",
      },
      {
        type: "Quotation Note",
        icon: "request_quote",
        title: "Quotation Note",
        english: "Standard lead time is 4-6 weeks from receipt of purchase order.",
        translation: "标准交期为收到采购订单后的 4 至 6 周。",
      },
      {
        type: "Internal Chat",
        icon: "chat",
        title: "Internal Chat",
        english: "Supplier just updated us. The lead time has been pushed back due to shipping delays.",
        translation: "供应商刚刚更新了进度。由于运输延误，交期已经推迟。",
      },
    ],
    quizDistractors: [
      "The maximum weight or volume capacity of a freight container.",
      "The payment period granted to a buyer after an invoice is issued.",
      "The percentage of products that pass a final quality inspection."
    ],
  },
  {
    id: "lesson-2",
    title: "Logistics Optimization",
    category: "Operations",
    description: "Understand critical shipping rules, responsibilities, and cargo risk transfers in global trade.",
    time: "10 min",
    level: "Intermediate",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBi5l5W13WN5Ra5h26twADwiATgH8WpVz9EqmNVCEkV019cH9n11lf8J1UU0Eb7uLUionkI2vz4lkU1jN1eYTJFy4NiX04FG9MGC9qCsYf_JWxNWmvhPt9zHfp5HA7ungSCaslTPDCcl_vvIdLIT_1mETum3-Rvq5cN4vbfXbtDxOMgN039uxDb7Pa4NF5MTGw61Agw0pLmZpLo7tcKQjuFmDzxd7hiW6fhRnLV8GJV5l2ZGyleHooTun4kVr7OXEnB26IT-rbEsbs",
    fullDefinition: "A shipping term indicating whether the seller or buyer is liable for goods damaged or destroyed during shipping. FOB shipping point means the buyer is responsible once shipped; FOB destination means the seller is responsible until delivery.",
    fullDefinitionCn: "一种用于明确运输途中货物损坏或灭失责任归属的贸易术语。FOB 装运港通常表示货物装船后风险转移给买方。",
    phonetic: "/ˌef.oʊˈbiː/",
    tag1: "Global Trade Logistics",
    tag2: "FOB (Free on Board)",
    scenarios: [
      {
        type: "Purchase Order",
        icon: "mail",
        title: "Purchase Order",
        english: "Please quote the unit price FOB Destination to our Oakland warehouse.",
        translation: "请按 FOB 条件报到我们奥克兰仓库的单价。",
      },
      {
        type: "Invoice Query",
        icon: "request_quote",
        title: "Invoice Query",
        english: "Is the freight cost included in the FOB Shipping Point agreement?",
        translation: "这份 FOB 装运港协议中是否包含运费？",
      },
    ],
    quizDistractors: [
      "A certificate confirming that a product passed factory inspection.",
      "A payment method that guarantees settlement before production starts.",
      "A warehouse rule requiring the oldest inventory to ship first."
    ],
  },
  {
    id: "lesson-3",
    title: "Quality Assurance Audits",
    category: "Strategy",
    description: "Deploy structured problem-solving methodologies to isolate non-conformances and prevent recurrence.",
    time: "12 min",
    level: "Advanced",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIxtTZ5XoVU-22fvg2lHgSZD-n-DaXrG-nN2bFvPAw5RTeq9jmYAGpJ61AlVT6e-Ms5Leskzsoc1hynsaCvA2j267RxrqxwsW8ostYLgE6gLS77pTmheeUxMO2GQj7-2PdA9JLaBw474vw_wHDsnBqagXiKqsaslixGiN6Ejc-vQNS0OLfWh4Ybkcw70b2WlZQOjBC_ZbcMhZfDveSaPKyqvUMTlVyjbPVR_N3rk0IUMlrZ-_36wRx8MI8Tg3Z5KC9Cf5qfmKr2NQ",
    fullDefinition: "A systematic process for identifying root causes of problems or events and an approach for responding to them. RCA assumes that it is much more effective to systematically prevent and solve underlying issues rather than just treating symptoms.",
    fullDefinitionCn: "一种系统识别问题根本原因并制定应对措施的方法。它强调解决底层原因，避免只处理表面症状而导致问题重复发生。",
    phonetic: "/ruːt kɔːz əˈnæl.ə.sɪs/",
    tag1: "Process Auditing",
    tag2: "Root Cause Analysis (RCA)",
    scenarios: [
      {
        type: "Meeting Agenda",
        icon: "mail",
        title: "Meeting Agenda",
        english: "We need to schedule a root cause analysis for the batch failures in manufacturing.",
        translation: "我们需要针对生产中的批次故障安排一次根本原因分析。",
      },
      {
        type: "Corrective Action",
        icon: "request_quote",
        title: "Corrective Action",
        english: "Implementing a thorough root cause analysis saved us from repeated assembly failures.",
        translation: "全面开展根本原因分析，避免了装配故障反复发生。",
      },
    ],
    quizDistractors: [
      "A pricing model that calculates a product's target profit margin.",
      "A logistics method used to select the shortest shipping route.",
      "A sales process for ranking customers by annual order value."
    ],
  },
];

export const initialIngestedDocs: IngestedDoc[] = [
  {
    id: "doc-1",
    title: "Customer Persona Guidelines 2024",
    fileType: "Word Doc",
    summary: "Comprehensive guidelines describing the typical professional English language learners in corporate environments. Outlines their key motivations, educational background, and learning constraints.",
    tags: ["Marketing", "Strategy"],
    timeString: "2h ago",
  },
  {
    id: "doc-2",
    title: "Competitor Feature Matrix",
    fileType: "Image",
    summary: "Visual comparison matrix showing major competitors in the professional corporate training market. Highlights their key AI capabilities, pricing models, and target demographics.",
    tags: ["Products", "Competitor"],
    timeString: "Yesterday",
    previewUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIxtTZ5XoVU-22fvg2lHgSZD-n-DaXrG-nN2bFvPAw5RTeq9jmYAGpJ61AlVT6e-Ms5Leskzsoc1hynsaCvA2j267RxrqxwsW8ostYLgE6gLS77pTmheeUxMO2GQj7-2PdA9JLaBw474vw_wHDsnBqagXiKqsaslixGiN6Ejc-vQNS0OLfWh4Ybkcw70b2WlZQOjBC_ZbcMhZfDveSaPKyqvUMTlVyjbPVR_N3rk0IUMlrZ-_36wRx8MI8Tg3Z5KC9Cf5qfmKr2NQ",
  },
];
