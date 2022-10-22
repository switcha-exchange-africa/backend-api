import { Injectable } from "@nestjs/common";
import { Admin } from "src/core/entities/Admin";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class AdminFactoryService {
  create(data: OptionalQuery<Admin>) {
    const admin = new Admin();
    if (data.firstName) admin.firstName = data.firstName;
    if (data.lastName) admin.lastName = data.lastName;
    if (data.email) admin.email = data.email;
    if (data.password) admin.password = data.password;
    if (data.lock) admin.lock = data.lock;
    if (data.roles) admin.roles = data.roles;
    if (data.image) admin.image = data.image
    admin.createdAt = new Date();
    admin.updatedAt = new Date();
    admin.lastLoginDate = new Date()
    return admin;
  }
}
