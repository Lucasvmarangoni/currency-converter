import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

@Injectable()
export class FindUsersService {
  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>,
  ) {}

  async findOne(usernameOrEmail: string): Promise<UserInfo | undefined> {
    let user: UserInfo;

    if (this.isEmail(usernameOrEmail)) {
      user = await this.userModel.findOne<UserInfo>({ email: usernameOrEmail });
    }
    user = await this.userModel.findOne<UserInfo>({
      username: usernameOrEmail,
    });

    return user;
  }

  isEmail(email: string) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  }
}
