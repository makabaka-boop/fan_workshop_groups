import type { FanStyle, ActivityInfo, Group } from '../types';

export const defaultActivity: ActivityInfo = {
  name: '草编团扇工作坊',
  date: new Date().toISOString().split('T')[0],
  totalDuration: 180,
  totalPeople: 30
};

const now = Date.now();
const oneDay = 24 * 60 * 60 * 1000;

export const mockStyles: FanStyle[] = [
  {
    id: '1',
    name: '简约竹叶款',
    difficulty: 'easy',
    suitablePeople: 8,
    duration: 45,
    status: 'beginner',
    materials: [
      { id: 'm1', name: '天然竹篾', quantity: 20, unit: '根', available: 30 },
      { id: 'm2', name: '棉线', quantity: 1, unit: '卷', available: 1 },
      { id: 'm3', name: '剪刀', quantity: 1, unit: '把', available: 2 }
    ],
    demoPoints: '1. 竹篾的基本编织方法\n2. 固定端点的技巧\n3. 边缘收边处理',
    faqs: [
      { id: 'f1', question: '竹篾断裂怎么办？', answer: '可以用棉线缠绕固定，或者更换新的竹篾' }
    ],
    backupPlan: '准备额外的竹篾材料，可提前预制半成品',
    createdAt: now - 7 * oneDay,
    updatedAt: now - 2 * oneDay
  },
  {
    id: '2',
    name: '经典梅花款',
    difficulty: 'medium',
    suitablePeople: 6,
    duration: 60,
    status: 'demo-required',
    materials: [
      { id: 'm4', name: '染色竹篾', quantity: 25, unit: '根', available: 20 },
      { id: 'm5', name: '梅花造型模板', quantity: 1, unit: '个', available: 1 },
      { id: 'm6', name: '白乳胶', quantity: 1, unit: '瓶', available: 2 }
    ],
    demoPoints: '1. 花瓣造型编织\n2. 颜色搭配技巧\n3. 中心固定方法',
    faqs: [
      { id: 'f2', question: '颜色不均匀怎么办？', answer: '可以用染色剂补色，或者设计成渐变效果' }
    ],
    backupPlan: '简化花瓣数量，从5瓣改为3瓣',
    createdAt: now - 6 * oneDay,
    updatedAt: now - 3 * oneDay
  },
  {
    id: '3',
    name: '复杂山水款',
    difficulty: 'hard',
    suitablePeople: 4,
    duration: 90,
    status: 'insufficient-material',
    materials: [
      { id: 'm7', name: '细竹篾', quantity: 40, unit: '根' },
      { id: 'm8', name: '多层骨架', quantity: 1, unit: '套' },
      { id: 'm9', name: '特殊编织工具', quantity: 1, unit: '套' }
    ],
    demoPoints: '1. 多层骨架搭建\n2. 山水图案编织\n3. 立体造型塑造',
    faqs: [
      { id: 'f3', question: '图案不对称怎么办？', answer: '可以在编织前画好参考线，或者调整造型设计' }
    ],
    backupPlan: '简化为平面图案，降低难度',
    createdAt: now - 5 * oneDay,
    updatedAt: now - 4 * oneDay
  },
  {
    id: '4',
    name: '传统吉祥款',
    difficulty: 'expert',
    suitablePeople: 3,
    duration: 120,
    status: 'demo-required',
    materials: [
      { id: 'm10', name: '精选老竹篾', quantity: 50, unit: '根' },
      { id: 'm11', name: '金线', quantity: 10, unit: '米' },
      { id: 'm12', name: '专业编织工具', quantity: 1, unit: '套' }
    ],
    demoPoints: '1. 传统纹样编织\n2. 金线镶嵌技巧\n3. 精修打磨工艺',
    faqs: [
      { id: 'f4', question: '金线容易断怎么办？', answer: '可以用双线编织，或者降低拉紧力度' }
    ],
    backupPlan: '更换为普通棉线，简化纹样',
    createdAt: now - 4 * oneDay,
    updatedAt: now - 1 * oneDay
  },
  {
    id: '5',
    name: '儿童简易款',
    difficulty: 'easy',
    suitablePeople: 10,
    duration: 30,
    status: 'display-only',
    materials: [
      { id: 'm13', name: '宽竹篾', quantity: 15, unit: '根' },
      { id: 'm14', name: '彩绳', quantity: 3, unit: '卷' },
      { id: 'm15', name: '安全剪刀', quantity: 1, unit: '把' }
    ],
    demoPoints: '1. 简单交叉编织\n2. 彩绳装饰\n3. 安全操作要点',
    faqs: [
      { id: 'f5', question: '孩子太小不会编怎么办？', answer: '可以使用预制骨架，只做装饰部分' }
    ],
    backupPlan: '准备贴纸作为替代装饰方式',
    createdAt: now - 3 * oneDay,
    updatedAt: now - 5 * oneDay
  },
  {
    id: '6',
    name: '现代几何款',
    difficulty: 'medium',
    suitablePeople: 5,
    duration: 55,
    status: 'beginner',
    materials: [
      { id: 'm16', name: '彩色竹篾', quantity: 30, unit: '根' },
      { id: 'm17', name: '几何模板', quantity: 1, unit: '个' },
      { id: 'm18', name: '量角器', quantity: 1, unit: '个' }
    ],
    demoPoints: '1. 几何图案设计\n2. 角度测量技巧\n3. 色彩组合方案',
    faqs: [
      { id: 'f6', question: '角度不准确怎么办？', answer: '可以使用模板辅助，或者设计自由图案' }
    ],
    backupPlan: '使用贴纸标记角度，降低测量难度',
    createdAt: now - 2 * oneDay,
    updatedAt: now - 6 * oneDay
  }
];

export const mockGroups: Group[] = [
  {
    id: 'g1',
    name: '第一组',
    peopleCount: 8,
    styleIds: ['1', '5']
  },
  {
    id: 'g2',
    name: '第二组',
    peopleCount: 6,
    styleIds: ['2']
  },
  {
    id: 'g3',
    name: '第三组',
    peopleCount: 4,
    styleIds: ['3', '4']
  }
];
