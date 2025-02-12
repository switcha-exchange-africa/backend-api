export abstract class IHttpServices {
  abstract get(url: string, config?: Record<string, any>);
  abstract delete(url: string, config: Record<string, any>);
  abstract post(url: string, data: Record <string, any>, config: Record<string, any>);
  abstract patch(url: string, data: Record <string, any>, config: Record<string, any>);
}
