export class ErrorDto {
  status: number

  message: string

  error: string | Record<string, any>
}