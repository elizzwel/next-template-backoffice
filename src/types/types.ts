// User types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role_id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface UserCreateData {
  email: string;
  password: string;
  name?: string;
  role_id?: string;
  [key: string]: any;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role?: string;
  role_id: string;
  permissions: string[];
}

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role_id: string;
  created_at: string;
  roles: Role | Role[] | null;
}

export interface TransformedUser {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role: Role | Role[] | null;
  createdAt: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role_id: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  password?: string;
  role_id?: string;
  [key: string]: any;
}


// Role types
export interface Role {
  id: string;
  name: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface RoleCreateData {
  name: string;
  permissions?: string[];
  [key: string]: any;
}

export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface RoleWithPermissions extends Role {
  permissions: string[];
}

export interface RoleCreateRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface RolePermissionInsert {
  role_id: string;
  permission_code: string;
}

export interface RolePermissionResponse {
  permission_code: string;
}

// Permission types
export interface Permission {
  code: string;
  name: string;
  description?: string;
  category?: string;
}

export interface RolePermission {
  permission_code: string;
  permissions: Permission | Permission[] | null;
}

export interface PermissionCreateRequest {
  code: string;
  name: string;
  description?: string;
  category?: string;
}

// Menu types
export interface MenuItem {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  permission_code?: string | null;
  is_active: boolean;
  sort_order: number;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface MenuItemUpdate {
  name?: string;
  path?: string;
  icon?: string;
  permission_code?: string | null;
  is_active?: boolean;
  sort_order?: number;
  parent_id?: string | null;
  [key: string]: any;
}

export interface RouteResponse {
  path: string;
  name: string;
  permission?: string | null;
  active: boolean;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SupabaseErrorResponse {
  error: string;
}

// Route params types
export interface RouteParams {
  params: {
    id: string;
  };
}