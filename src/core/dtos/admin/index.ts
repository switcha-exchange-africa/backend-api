import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";
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
  @IsNotEmpty()
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
  id: string
}


export type IAddAdminImage = AddAdminImageDto & {
  id: string
  email: string
}

export type IChangeAdminPassword = ChangeAdminPasswordDto & {
  id: string
}

export class AdminLoginDto extends LoginDto { }
export type IAdminLogin = AdminLoginDto & {}