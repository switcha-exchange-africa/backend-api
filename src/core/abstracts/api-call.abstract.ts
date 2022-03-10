export abstract class IAPICallServices {
  abstract get(url: string);
  abstract delete(url: string);
  abstract post(url: string, data: any);
  abstract patch(url: string, data: any);
}
