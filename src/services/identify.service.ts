import { axiosNestAuth } from "@/lib/axios-nest-auth";

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
}

export type GetIdentityResponse = Identity[];

export const getIdentityService = async (): Promise<GetIdentityResponse> => {
  const { data } = await axiosNestAuth.get<GetIdentityResponse>("/identity");

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
  const route = status ? `/api/identity/${id}/activate` : `/identity/${id}/activate`;

  const { data } = await axiosNestAuth.patch<ActivateIdentityResponse>(route);

  return data;
};

//=================================================================================
//                                    Identify Id
//=================================================================================
import { axiosNestGa } from "@/lib/axios-nest-ga";

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
  const { data } = await axiosNestGa.get<GetIdentityUserResponse>(`/identity/${id}`);

  return data;
};
