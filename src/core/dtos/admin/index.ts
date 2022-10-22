import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Types } from 'mongoose';
import { LoginDto } from "../authentication/login.dto";

export class AdminDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class AddAdminRoleDto {
  @IsArray()
  public roles: string[]
}

export class AddAdminImageDto {
  @IsString()
  @IsNotEmpty()
  public image: string
}

export class ChangeAdminPasswordDto {
  @IsString()
  @IsNotEmpty()
  public password: string

  @IsString()
  @IsNotEmpty()
  public oldPassword: string

}


export type IAdmin = AdminDto & {}
export type IAddAdminRoles = AddAdminRoleDto & {
  id: Types.ObjectId;
}


export type IAddAdminImage = AddAdminImageDto & {
  id: Types.ObjectId;
}

export type IChangeAdminPassword = ChangeAdminPasswordDto & {
  id: Types.ObjectId;

}

export class AdminLoginDto extends LoginDto { }
export type IAdminLogin = AdminLoginDto & {}