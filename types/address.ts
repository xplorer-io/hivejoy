// =============================================
// Address Types
// =============================================

/** Saved address entity (stored in DB, one user can have many) */
export interface Address {
  id: string;
  userId: string;
  label: 'home' | 'work' | 'other';
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

/** Immutable address snapshot embedded in orders and profiles */
export interface AddressSnapshot {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}
