import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'vote' })
export class Vote {
  // ----- ----- ----- Relations ----- ----- ----- //

  @Prop({
    type: Types.ObjectId,
    unique: false,
    required: true,
    nullable: false,
    ref: 'User',
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    unique: false,
    required: true,
    nullable: false,
    ref: 'Quote',
  })
  quoteId: Types.ObjectId;

  // ----- ----- ----- Timestamps ----- ----- ----- //

  @Prop({
    type: Date,
    unique: false,
    required: true,
    nullable: false,
  })
  createdAt: Date;
}

export type VoteDocument = HydratedDocument<Vote>;
export const VoteSchema = SchemaFactory.createForClass(Vote);
