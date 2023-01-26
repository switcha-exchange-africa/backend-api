import { IDataServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IAddAdminImage, IAddAdminRoles, IAdmin, IAdminLogin, IChangeAdminPassword } from "src/core/dtos/admin";
import { AdminFactoryService } from "./admin-factory.service";
import { compareHash, hash } from 'src/lib/utils';
import { Admin } from "src/core/entities/Admin";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { INCOMPLETE_AUTH_TOKEN_VALID_TIME, JWT_USER_PAYLOAD_TYPE } from "src/lib/constants";
import jwtLib from "src/lib/jwtLib";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../utils/utils.service";

@Injectable()
export class AdminServices {
  constructor(
    private data: IDataServices,
    private factory: AdminFactoryService,
    private utilsService: UtilsServices
  ) { }

  async signup(payload: IAdmin) {
    try {

      const adminExists = await this.data.admins.findOne({ email: payload.email })
      if (adminExists) return Promise.reject({
        status: HttpStatus.CONFLICT,
        state: ResponseState.ERROR,
        message: 'Admin already exists',
        error: null,
      })

      const password = await hash(payload.password)
      const adminPayload = { ...payload, password }

      const factory = await this.factory.create(adminPayload)
      const data = await this.data.admins.create(factory);
      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: data._id,
        email: data.email
      }
      const token = await jwtLib.jwtSign(jwtPayload, `${INCOMPLETE_AUTH_TOKEN_VALID_TIME}h`) as string;

      return {
        status: HttpStatus.CREATED,
        message: "Admin signed up successfully",
        token: `Bearer ${token}`,
        data: jwtPayload,
        state: ResponseState.SUCCESS,
      };

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ADMIN SIGNUP',
        error,
        email: payload.email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async addRoles(payload: IAddAdminRoles) {
    try {

      const { id, roles } = payload
      const data = await this.data.admins.update({ _id: id }, { roles })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
        data,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ADMIN ADD ROLES',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async addImage(payload: IAddAdminImage) {
    try {

      const { id, image } = payload
      const data = await this.data.admins.update({ _id: id }, { image })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
        data,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ADMIN ADD IMAGE',
        error,
        email: payload.email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async removeImage(id: string) {
    try {

      const data = await this.data.admins.update({ _id: id }, { image: '' })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
        data,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ADMIN REMOVE IMAGE',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async enableTwoFa(id: string) {
    try {

      const data = await this.data.admins.update({ _id: id }, { twoFa: true })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
        data,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ADMIN ENABLE 2 FA',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async disableTwoFa(id: string) {
    try {

      const data = await this.data.admins.update({ _id: id }, { twoFa: false })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
        data,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ADMIN DISABLE TWO FA',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
  async changePassword(payload: IChangeAdminPassword) {
    try {

      const { id, password, oldPassword } = payload
      const admin = await this.data.admins.findOne({ _id: id })

      const correctPassword: boolean = await compareHash(oldPassword, admin?.password);
      if (!correctPassword) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: 'Email or Password is incorrect',
        error: null,
      })

      const data = await this.data.admins.update({ _id: id }, { password: await hash(password) })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
        data,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ADMIN CHANGE PASSWORD',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }


  async login(payload: IAdminLogin): Promise<ResponsesType<Admin>> {
    try {
      const { email, password } = payload
      const admin = await this.data.admins.findOne({ email });

      if (!admin) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: 'Admin does not exists',
        error: null,
      })
      if (admin.lock) return Promise.reject({
        status: HttpStatus.FORBIDDEN,
        state: ResponseState.ERROR,
        message: 'Account is temporary locked',
        error: null,
      })

      const correctPassword: boolean = await compareHash(password, admin?.password!);
      if (!correctPassword) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: 'Email or Password is incorrect',
        error: null,
      })

      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: String(admin?._id),
        email: admin?.email,
      }
      const token = await jwtLib.jwtSign(jwtPayload);

      await this.data.admins.update({ _id: admin._id }, {
        $set: {
          lastLoginDate: new Date()
        }
      })

      return {
        status: HttpStatus.OK,
        message: 'Admin logged in successfully',
        token: `Bearer ${token}`,
        data: jwtPayload,
        state: ResponseState.SUCCESS,
      }
    } catch (error: Error | any | unknown) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ADMIN LOGIN',
        error,
        email: payload.email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
}


