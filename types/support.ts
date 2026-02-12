// =============================================
// Support Types
// =============================================

import type { UserRole } from './user';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  orderId?: string;
  subOrderId?: string;
  userId: string;
  reason: string;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  createdAt: string;
}
