export type ApiErrorResponse = {
  message?: string
  error?: string
  falhas?: {
    codigoDisciplina: number
    motivo: string
    jaNoPlano?: boolean
  }[]
}

export class ApiError extends Error {
  status: number
  data?: ApiErrorResponse

  constructor(message: string, status: number, data?: ApiErrorResponse) {
    super(message)
    this.status = status
    this.data = data
  }
}
