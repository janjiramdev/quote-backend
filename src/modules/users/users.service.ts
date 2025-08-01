import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ICreateOneUserInput,
  IUserInterface,
} from 'src/interfaces/users.interface';
import { User, UserDocument } from 'src/schemas/user.schema';
import { EncodeUtil } from 'src/utils/encode.util';
import { UpdateUserByIdDto } from './dtos/update-user-by-id.dto';

@Injectable()
export class UsersService {
  private readonly logger: Logger;
  private readonly encodeUtil: EncodeUtil;

  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    this.logger = new Logger(UsersService.name);
    this.encodeUtil = new EncodeUtil();
  }

  async createOne(input: ICreateOneUserInput): Promise<UserDocument> {
    return await this.userModel
      .create({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
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

  async getProfile(input: string): Promise<IUserInterface> {
    try {
      const user = await this.userModel.findOne({ _id: input }).exec();
      if (!user)
        throw new NotFoundException(`user with id: ${input} not found`);

      return user as unknown as IUserInterface;
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async updateProfile(
    id: string,
    input: UpdateUserByIdDto,
  ): Promise<IUserInterface> {
    try {
      const { displayName, password } = input;

      if (!displayName && !password)
        throw new BadRequestException(
          `updateUser detail not found: ${JSON.stringify(input)}`,
        );

      const user = await this.findOneById(id);
      if (!user) throw new NotFoundException(`user with id: ${id} not found`);

      const updateObject = {
        ...(displayName && { displayName }),
        ...(password && { password: this.encodeUtil.hashData(password) }),
        updatedAt: new Date(),
      };

      return (await this.userModel
        .findOneAndUpdate({ _id: id }, updateObject, { new: true })
        .exec()) as unknown as IUserInterface;
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
