export interface User { id: number; name: string; email: string; role: "USER" | "ADMIN"; }
export interface Project {
  id: number; name: string; description: string;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  createdAt: string; updatedAt: string;
  ownerId: number; ownerName: string; taskCount: number;
}
export interface Task {
  id: number; title: string; description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  dueDate: string; createdAt: string; updatedAt: string;
  projectId: number; projectName: string;
  assigneeId: number | null; assigneeName: string | null;
}
export interface AuthResponse { token: string; name: string; email: string; role: string; }
