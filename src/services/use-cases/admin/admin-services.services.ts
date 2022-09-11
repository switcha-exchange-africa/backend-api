import { IDataServices } from "src/core/abstracts";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IAddAdminImage, IAddAdminRoles, IAdmin, IAdminLogin, IChangeAdminPassword } from "src/core/dtos/admin";
import { AdminFactoryService } from "./admin-factory.service";
import { compareHash, hash } from 'src/lib/utils';
import { AlreadyExistsException, BadRequestsException, DoesNotExistsException, ForbiddenRequestException } from "../user/exceptions";
import { Types } from 'mongoose';
import { Admin } from "src/core/entities/Admin";
import { ResponsesType } from "src/core/types/response";
import { JWT_USER_PAYLOAD_TYPE, USER_LOCK } from "src/lib/constants";
import jwtLib from "src/lib/jwtLib";

@Injectable()
export class AdminServices {
  constructor(
    private data: IDataServices,
    private factory: AdminFactoryService
  ) { }

  async signup(payload: IAdmin) {
    try {

      const adminExists = await this.data.admins.findOne({ email: payload.email })
      if (adminExists) throw new AlreadyExistsException('Admin already exists')

      const password = await hash(payload.password)
      const adminPayload = { ...payload, password }

      const factory = await this.factory.create(adminPayload)
      const data = await this.data.admins.create(factory);

      return {
        message: "Admin created successfully",
        status: HttpStatus.CREATED,
        data,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async addRoles(payload: IAddAdminRoles) {
    try {

      const { id, roles } = payload
      const data = await this.data.admins.update({ _id: id }, { roles })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        data,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async addImage(payload: IAddAdminImage) {
    try {

      const { id, image } = payload
      const data = await this.data.admins.update({ _id: id }, { image })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        data,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async removeImage(id: Types.ObjectId) {
    try {

      const data = await this.data.admins.update({ _id: id }, { image: '' })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        data,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async enableTwoFa(id: Types.ObjectId) {
    try {

      const data = await this.data.admins.update({ _id: id }, { twoFa: true })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        data,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async disableTwoFa(id: Types.ObjectId) {
    try {

      const data = await this.data.admins.update({ _id: id }, { twoFa: false })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        data,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
  async changePassword(payload: IChangeAdminPassword) {
    try {

      const { id, password, oldPassword } = payload

      const correctPassword: boolean = await compareHash(password, oldPassword);
      if (!correctPassword) throw new BadRequestsException('Password is incorrect') //

      const data = await this.data.admins.update({ _id: id }, { password: await hash(password) })
      return {
        message: "Admin updated successfully",
        status: HttpStatus.OK,
        data,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }


  async login(payload: IAdminLogin): Promise<ResponsesType<Admin>> {
    try {
      const { email, password } = payload
      const admin = await this.data.admins.findOne({ email });

      const verification: string[] = []
      if (!admin) throw new DoesNotExistsException('Admin does not exists')
      if (admin.lock === USER_LOCK.LOCK) throw new ForbiddenRequestException('Account is temporary locked')


      const correctPassword: boolean = await compareHash(password, admin?.password!);
      if (!correctPassword) throw new BadRequestsException('Password is incorrect') //


      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: admin?._id,
        fullName: `${admin?.firstName} ${admin?.lastName}`,
        email: admin?.email,
        lock: admin?.lock,
      }
      const token = await jwtLib.jwtSign(jwtPayload);

      await this.data.admins.update({ _id: admin._id }, {
        $set: {
          lastLoginDate: new Date()
        }
      })

      return {
        status: 200,
        message: 'Admin logged in successfully',
        token: `Bearer ${token}`,
        data: jwtPayload,
        verification
      }
    } catch (error: Error | any | unknown) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }
}


