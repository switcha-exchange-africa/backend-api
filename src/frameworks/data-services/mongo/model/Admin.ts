import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import {  Document } from "mongoose";

export type AdminDocument = Admin & Document;

@Schema({
  timestamps: true

})
export class Admin {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true })
  email: string;


  @Prop()
  password: string

  @Prop()
  image: string

  @Prop()
  lastLoginDate: Date

  @Prop()
  createdAt: Date

  @Prop({ default: false })
  twoFa: boolean

  @Prop({ default: false })
  emailVerified: boolean
  
  @Prop()
  updatedAt: Date

  @Prop({ default: false })
  lock: boolean;

  @Prop()
  roles: string[]

}

export const AdminSchema = SchemaFactory.createForClass(Admin);

