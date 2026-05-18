export interface Event {
  id: string;
  title: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  points: number;
  type: "academic" | "volunteer" | "sports" | "club" | "social" | "international";
  badge?: string;
  icon: string;
  color: string;
}

export interface Scholarship {
  id: string;
  name: string;
  value: string;
  deadline: string;
  progress: number;
  icon: string;
  bgColor: string;
  provider?: string;
  type?: string;
}

export interface AIRecommendation {
  type: "event" | "scholarship";
  title: string;
  reason: string;
}

export type SavedItemStatus = "Quan tâm" | "Đã đăng ký" | "Đã nộp đơn" | "Hoàn thành" | "Bị từ chối" | "Đã tham gia";

export interface SavedItem {
  id: string;
  itemId: string;
  type: "event" | "scholarship";
  title: string;
  icon: string;
  status: SavedItemStatus;
  deadline?: string;
}

export interface CheckInRecord {
  id: string;
  eventName: string;
  time: string;
  points: number;
  icon: string;
  background: string;
  status: "Đã check-in" | "Hoàn thành";
  type: string;
  location: string;
  date: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "deadline" | "system" | "success";
  read: boolean;
}
