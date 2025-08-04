import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ICreateUserInput,
  IUpdateUserRefreshTokenInput,
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

  async createUser(input: ICreateUserInput): Promise<UserDocument> {
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

  async findUserByUsername(
    input: string,
  ): Promise<UserDocument | null | undefined> {
    return await this.userModel
      .findOne({ username: input })
      .select('+password');
  }

  async findUserById(input: string): Promise<UserDocument | null | undefined> {
    return await this.userModel
      .findOne({ _id: new Types.ObjectId(input) })
      .select('+refreshToken')
      .exec();
  }

  async updateUserRefreshToken(
    input: IUpdateUserRefreshTokenInput,
  ): Promise<void> {
    const { _id, refreshToken } = input;
    await this.userModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(_id) },
        { refreshToken, updatedAt: new Date() },
      )
      .exec();
  }

  async updateProfile(
    id: string,
    input: UpdateUserByIdDto,
  ): Promise<UserDocument> {
    try {
      const { displayName, password } = input;

      if (!displayName && !password)
        throw new BadRequestException(
          `updateUser detail not found: ${JSON.stringify(input)}`,
        );

      const user = await this.findUserById(id);
      if (!user) throw new NotFoundException(`user with id: ${id} not found`);

      if (displayName) user.displayName = displayName;
      if (password) user.password = this.encodeUtil.hashData(password);
      user.updatedAt = new Date();

      return user.save();
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
