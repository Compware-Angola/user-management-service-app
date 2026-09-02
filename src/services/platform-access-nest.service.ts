import { axiosNestAuth } from "@/lib/axios-nest-auth";

export interface CreatePlatformAccessPayload {
  userId: number;
  platformCode: string;
  platformUserKey: string;
}

export interface PlatformAccessResponse {
  id: number;
  userId: number;
  platformCode: string;
  platformUserKey: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export const createPlatformAccessNest = async (
  payload: CreatePlatformAccessPayload,
): Promise<PlatformAccessResponse> => {
  const { data } = await axiosNestAuth.post<PlatformAccessResponse>(
    "/platform-access",
    payload,
  );
  return data;
};
