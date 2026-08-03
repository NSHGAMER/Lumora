export type SystemRole = 'student' | 'faculty' | 'admin';

export type ActiveTab = 'home' | 'command' | 'academics' | 'jsr' | 'campus';

export interface JSRMessage {
  id: string;
  sender: 'jsr' | 'user';
  text: string;
  timestamp: string;
  codeSnippet?: string;
  actionButtons?: { label: string; action: string }[];
  category?: 'academic' | 'campus' | 'code' | 'general';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  room: string;
  time: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  credits: number;
  workloadScore: number; // 1-10 scale
  color: string;
  enrolled: number;
  capacity: number;
}

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  occupancyPercent: number;
  activeWorkstations: number;
  availableWorkstations: number;
  temperature: string;
  energyGridKw: number;
  status: 'optimal' | 'busy' | 'full';
  coordinates: { x: number; y: number; z: number };
}

export interface CommandItem {
  id: string;
  title: string;
  category: 'Module' | 'JSR AI' | 'Action' | 'Course';
  iconName: string;
  shortcut?: string;
  action: () => void;
}
