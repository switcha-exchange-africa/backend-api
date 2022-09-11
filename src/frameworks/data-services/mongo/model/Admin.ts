import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';

export type AdminDocument = Admin & Document;

@Schema()
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

  @Prop()
  updatedAt: Date

  @Prop({ default: false })
  lock: boolean;

  @Prop()
  roles: string[]

}

export const AdminSchema = SchemaFactory.createForClass(Admin);

