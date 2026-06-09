export type StyleStatus = 'beginner' | 'demo-required' | 'insufficient-material' | 'display-only';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  available?: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface FanStyle {
  id: string;
  name: string;
  difficulty: DifficultyLevel;
  suitablePeople: number;
  duration: number;
  status: StyleStatus;
  materials: MaterialItem[];
  demoPoints: string;
  faqs: FAQ[];
  backupPlan: string;
  createdAt: number;
  updatedAt: number;
}

export interface Group {
  id: string;
  name: string;
  peopleCount: number;
  styleIds: string[];
}

export interface ActivityInfo {
  name: string;
  date: string;
  totalDuration: number;
  totalPeople: number;
}

export type AlertType = 'high-difficulty' | 'material-shortage' | 'duplicate-demo' | 'time-exceeded';

export interface Alert {
  id: string;
  type: AlertType;
  severity: 'warning' | 'error';
  message: string;
  details?: string;
}

export interface FilterCriteria {
  difficulty?: DifficultyLevel;
  materialKeyword?: string;
  minPeople?: number;
  maxPeople?: number;
  status?: StyleStatus;
}

export interface GroupMaterialItem {
  id: string;
  name: string;
  unit: string;
  totalRequired: number;
  available: number;
  shortage: number;
  isSufficient: boolean;
  styleBreakdown: {
    styleId: string;
    styleName: string;
    quantityPerStyle: number;
    totalForStyle: number;
  }[];
}

export interface AllMaterialSummary {
  name: string;
  unit: string;
  totalRequired: number;
  totalAvailable: number;
  totalShortage: number;
  isSufficient: boolean;
  groupBreakdown: {
    groupId: string;
    groupName: string;
    required: number;
  }[];
}
