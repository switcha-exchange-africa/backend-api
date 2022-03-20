import { Injectable } from "@nestjs/common";
import axios from "axios";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";

@Injectable()
export class CustomAxiosService implements IHttpServices {
  async get(url: string, config: Record<string, any>) {
    try {
      const response = await axios.get(url, config);
      if (response?.data?.data) return Promise.resolve(response.data.data);
      if (response?.data?.responseBody)
        return Promise.resolve(response.data.responseBody);
      return Promise.resolve(response?.data);
    } catch (error) {
      if (error?.response?.data) return Promise.reject(error?.response?.data);
      return Promise.reject(error);
    }
  }
  async delete(url: string, config: Record<string, any>) {
    try {
      const response = await axios.delete(url, config);
      if (response?.data?.data) return Promise.resolve(response.data.data);
      if (response?.data?.responseBody)
        return Promise.resolve(response.data.responseBody);
      return Promise.resolve(response?.data);
    } catch (error) {
      if (error?.response?.data) return Promise.reject(error?.response?.data);
      return Promise.reject(error);
    }
  }
  async post(
    url: string,
    data: Record<string, any>,
    config: Record<string, any>
  ) {
    try {
      const response = await axios.post(url, data, config);
      if (response?.data?.data) return Promise.resolve(response.data.data);
      if (response?.data?.responseBody)
        return Promise.resolve(response.data.responseBody);
      return Promise.resolve(response?.data);
    } catch (error) {
      if (error?.response?.data) return Promise.reject(error?.response?.data);
      return Promise.reject(error);
    }
  }
  async patch(
    url: string,
    data: Record<string, any>,
    config: Record<string, any>
  ) {
    try {
      const response = await axios.patch(url, data, config);
      if (response?.data?.data) return Promise.resolve(response.data.data);
      if (response?.data?.responseBody)
        return Promise.resolve(response.data.responseBody);
      return Promise.resolve(response?.data);
    } catch (error) {
      if (error?.response?.data) return Promise.reject(error?.response?.data);
      return Promise.reject(error);
    }
  }
}
