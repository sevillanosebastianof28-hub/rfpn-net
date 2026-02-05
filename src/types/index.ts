// User Roles
export type UserRole = 'super_admin' | 'central_admin' | 'developer' | 'broker';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  branding: TenantBranding;
  createdAt: Date;
  updatedAt: Date;
  userCount: number;
}

export interface TenantBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Application {
  id: string;
  tenantId: string;
  tenantName: string;
  applicantName: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  type: string;
  amount: number;
  submittedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resourceType: 'user' | 'tenant' | 'application' | 'system';
  resourceId: string;
  details: string;
  ipAddress: string;
  timestamp: Date;
}

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'role_change'
  | 'user_activated'
  | 'user_deactivated'
  | 'tenant_created'
  | 'tenant_updated'
  | 'tenant_activated'
  | 'tenant_deactivated'
  | 'application_created'
  | 'application_status_change';

export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  pendingApplications: number;
  recentActivity: number;
}

// Auth context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
