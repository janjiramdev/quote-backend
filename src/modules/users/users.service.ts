import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICreateOneUserInput } from 'src/interfaces/users.interface';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createOne(input: ICreateOneUserInput): Promise<UserDocument> {
    return await this.userModel
      .create({
        ...input,
        createdAt: new Date(),
      })
      .then((result) => {
        const formattedResult = result.toObject() as Record<string, any>;
        delete formattedResult.password;
        return formattedResult as UserDocument;
      });
  }

  async findOneByUsername(
    input: string,
  ): Promise<UserDocument | null | undefined> {
    return await this.userModel
      .findOne({ username: input })
      .select('+password');
  }

  async findOneById(input: string): Promise<UserDocument | null | undefined> {
    return await this.userModel.findOne({ _id: input }).exec();
  }
}
