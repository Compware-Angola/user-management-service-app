import { axiosNestAuth } from "@/lib/axios-nest-auth";

export interface Platform {
  id: number;
  code: string;
  name: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPlatform {
  id: number;
  userId: number;
  platformId: number;
  platformUserKey: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  platform: Platform;
}

export interface Identity {
  id: number;
  username: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  bi: string;
  avatar: string;
  status: number;
  emailVerified: number;
  phoneVerified: number;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userPlatforms: UserPlatform[];
}

export interface IdentityMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetIdentityResponse {
  data: Identity[];
  meta: IdentityMeta;
}

export interface GetIdentityParams {
  page?: number;
  limit?: number;
  search?: string | undefined;
  status?: number | undefined;
  platformCode?: string | undefined;
}

export const getIdentityService = async ({
  page = 1,
  limit = 10,
  search,
  status,
  platformCode,
}: GetIdentityParams = {}): Promise<GetIdentityResponse> => {
  const { data } = await axiosNestAuth.get<GetIdentityResponse>("/identity", {
    params: {
      page,
      limit,
      search,
      status,
      platformCode,
    },
  });

  return data;
};

//=====================================================================================
//                                Activate/Desactivate identify
//=====================================================================================

export interface ActivateIdentityParams {
  id: number;
  status: boolean;
}

export interface ActivateIdentityResponse {
  message: string;
}

export const activateIdentityService = async ({
  id,
  status,
}: ActivateIdentityParams): Promise<ActivateIdentityResponse> => {
  const route = status ? `/identity/${id}/activate` : `/identity/${id}/deactivate`;

  const { data } = await axiosNestAuth.patch<ActivateIdentityResponse>(route);

  return data;
};

//=================================================================================
//                                    Identify Id
//=================================================================================

export interface IdentityUserPlatform {
  id: number;
  userId: number;
  platformId: number;
  platformUserKey: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  platform: IdentityPlatform;
}

export interface IdentityPlatform {
  id: number;
  code: string;
  name: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface IdentityUser {
  id: number;
  username: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  bi: string;
  avatar: string;
  status: number;
  emailVerified: number;
  phoneVerified: number;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userPlatforms: IdentityUserPlatform[];
}

export type GetIdentityUserResponse = IdentityUser;

export const getIdentityUserService = async (id: number): Promise<GetIdentityUserResponse> => {
  const { data } = await axiosNestAuth.get<GetIdentityUserResponse>(`/identity/${id}`);

  return data;
};

//=====================================================================================
//                                  Create Identity
//=====================================================================================

export interface CreateIdentityPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  bi: string;
  avatar: string;
  password: string;
}

export interface CreateIdentityResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  bi: string;
  avatar: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export const createIdentityService = async (
  payload: CreateIdentityPayload,
): Promise<CreateIdentityResponse> => {
  const { data } = await axiosNestAuth.post<CreateIdentityResponse>("/identity", payload);
  return data;
};
