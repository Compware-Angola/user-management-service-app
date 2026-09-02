
import { AdditionalInformation, fetchAdditionalInformation, fetchUserProfile, TeacherProfile } from "@/services/teacher/fetch-profile";
import { useQuery } from "@tanstack/react-query";

export function useQueryTeacherProfile() {
  return useQuery<TeacherProfile | null, Error>({
    queryKey: ["teacher-profile"],
    queryFn: () => fetchUserProfile(),
  });
}


export function useQueryAdditionalInformation(enabled: boolean, anoLetivo?: string) {
  return useQuery<AdditionalInformation[], Error>({
    queryKey: ["additional-information", anoLetivo],
    queryFn: () => fetchAdditionalInformation(Number(anoLetivo)),
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

