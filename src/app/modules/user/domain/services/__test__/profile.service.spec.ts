import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { FindUser } from '@src/app/modules/user/util/find-user';
import { ProfileService } from '@src/app/modules/user/domain/services/profile.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ProfileService', () => {
  let profileService: ProfileService;
  let findUser: FindUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: FindUser,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken('UserModel'),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    profileService = module.get<ProfileService>(ProfileService);
    findUser = module.get<FindUser>(FindUser);
  });

  it('should return user profile if id and username match', async () => {
    const req = {
      id: '1',
      username: 'test',
      email: 'test@test.com',
    };
    const user = {
      id: '1',
      username: 'test',
      email: 'test@test.com',
      name: 'Test User',
      password: 'ghiG67$%jk',
      createdAt: new Date(),
    };

    jest.spyOn(findUser, 'findOne').mockResolvedValue(user);

    expect(await profileService.execute(req)).toEqual({
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  });

  it('should throw UnauthorizedException if id or username do not match', async () => {
    const req = {
      id: '2',
      username: 'test2',
      email: 'test2@test.com',
    };
    const user = {
      id: '1',
      username: 'test',
      email: 'test@test.com',
      name: 'Test User',
      password: 'ghiG67$%jk',
      createdAt: new Date(),
    };

    jest.spyOn(findUser, 'findOne').mockResolvedValue(user);

    await expect(profileService.execute(req)).rejects.toThrow(UnauthorizedException);
  });
});
