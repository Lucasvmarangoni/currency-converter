import { CreateService } from './create.service';
import * as crypto from 'crypto';
import { FindUser } from '@src/app/modules/user/util/find-user';
import {
  Inject,
  Injectable,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { UserGoogleData } from '@src/app/common/interfaces/user-google-data';
import { UserResponse } from '@src/app/modules/user/domain/services/interfaces/user-res';

@Injectable()
export class CreateForOAuth {
  constructor(
    private readonly findUser: FindUser,
    @Inject(forwardRef(() => CreateService)) private createService: CreateService
  ) {}

  async execute(userData: UserGoogleData): Promise<UserResponse> {
    const { name, email } = userData;
    const password = this.generateRandomPassword(30);
    const username = await this.generateRandomUsername(userData, 5);

    return await this.createService.execute({
      name,
      email,
      username,
      password,
    });
  }

  private generateRandomPassword(length: number): string {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const numbers = '0123456789';
    const allChars = uppercaseChars + lowercaseChars + numbers + symbolChars;

    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, allChars.length);
      password += allChars.charAt(randomIndex);
    }
    return password;
  }

  private async generateRandomUsername(
    userData: UserGoogleData,
    length: number
  ): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const { name } = userData;
    const maxAttempts = 1000;

    const usersnames = await this.findUser.findAllUsernames();

    for (let attempts = 0; attempts < maxAttempts; ) {
      const generateUsername = this.generateRandomString(characters, length, name);

      const check = usersnames.filter((username) => {
        return username === generateUsername;
      });

      if (check.length === 0) {
        return generateUsername;
      }
      attempts++;
    }

    throw new UnprocessableEntityException(
      'Unprocessable Entity: Error to generate username',
      {
        cause: new Error(),
        description:
          'The server was unable to create a valid username. Please contact support.',
      }
    );
  }

  private generateRandomString(characters: string, length: number, name: string): string {
    return Array(length)
      .fill('')
      .map(() => characters.charAt(crypto.randomInt(0, characters.length)))
      .join('')
      .concat(name.replace(/\s/g, '-'));
  }
}
