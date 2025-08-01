import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'users' })
export class User {
  @Prop({ type: String, unique: true, required: true, nullable: false })
  username: string;

  @Prop({ type: String, unique: false, required: true, nullable: false })
  displayName: string;

  @Prop({
    type: String,
    unique: false,
    required: true,
    nullable: false,
    select: false,
  })
  password: string;

  // ----- ----- ----- Timestamps ----- ----- ----- //

  @Prop({
    type: Date,
    unique: false,
    required: true,
    nullable: false,
  })
  createdAt: Date;

  @Prop({
    type: Date,
    unique: false,
    required: true,
    nullable: false,
  })
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
