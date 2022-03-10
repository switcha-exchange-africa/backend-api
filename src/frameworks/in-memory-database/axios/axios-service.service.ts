import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { map } from "rxjs";
import { IAPICallServices } from "src/core/abstracts/api-call.abstract";

@Injectable()
export class CustomAxiosService implements IAPICallServices {
  constructor(private httpService: HttpService) {}
  async get(url: string) {
    try {
      const value = await this.httpService.get(url);
      return value.pipe(map((res) => res.data));
    } catch (error) {
      Logger.error(error);
    }
  }
  async delete(url: string) {
    try {
      await this.httpService.delete(url);
    } catch (error) {
      Logger.error(error);
    }
  }
  async post(url: string, data: any) {
    try {
      const params = JSON.stringify(data);
      const value = await this.httpService.post(url, params, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return value.pipe(map((res) => res.data));
    } catch (error) {
      Logger.error(error);
    }
  }
  async patch(url: string, data: any) {
    try {
      const params = JSON.stringify(data);
      const value = await this.httpService.patch(url, params, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return value.pipe(map((res) => res.data));
    } catch (error) {
      Logger.error(error);
    }
  }
}
