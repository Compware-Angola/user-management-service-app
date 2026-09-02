import { axiosNestGa } from "@/lib/axios-nest-ga";
export interface TeacherProfile {
  pessoaid: number;
  codigo_docente: number;
  email: string | null;
  username: string;
  nome: string;
  nome_pai: string | null;
  nome_mae: string | null;
  data_nascimento: string | null;
  numero_documento: string | null;
  data_emissao: string | null;
  contacto_1: string;
  contacto_2: string;
  data_inicio_docente: string;
  endereco: string | null;
  n_mecanografico: string | null;
  codigo_escalao: number | null;
  codigo_categoria: number | null;
  descricao_categoria: string | null;
  escalao: string | null;
  descricao_grau_academico: string | null;
  faculdade_designacao: string | null;
}
export interface TeacherProfileApiResponse {
  success: boolean;
  data: TeacherProfile[];
}


export async function fetchUserProfile(

): Promise<TeacherProfile | null> {
  try {
    const response = await axiosNestGa.get<TeacherProfileApiResponse>(
      `/users-ga/profile`
    );

    const data = response.data?.data ?? [];



    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Erro ao buscar perfil do docente:", error);
    return null;
  }
}

export interface AdditionalInformation {
  codigo_docente: number;
  ano_lectivo: number;
  codigo_grade: number;
  codigo_classe: number;
  disciplina: string;
  semestre: number;


  cargo_designacao: string;
  codigo_curso: number;
  codigo_faculdade: number;
  curso_designacao: string;
  faculdade_designacao: string;



}
export interface AdditionalInformationApiResponse {
  success: boolean;
  data: AdditionalInformation[];
}


export async function fetchAdditionalInformation(anoLetivo?: number) {
  try {
    const params = new URLSearchParams();
    if (anoLetivo) {
      params.append('anoLetivo', String(anoLetivo));
    }
    const response = await axiosNestGa.get<AdditionalInformationApiResponse>(
      `/users-ga/additional-information?${params.toString()}`
    );

    const data = response.data?.data ?? null;
    return data;
  } catch (error) {
    console.error("Erro ao buscar perfil do docente:", error);
    return null;
  }
}


