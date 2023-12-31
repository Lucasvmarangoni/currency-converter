import { Test, TestingModule } from '@nestjs/testing';
import { CreateForOAuth } from '@src/app/modules/user/domain/services/create.oauth.service';
import { CreateService } from '@src/app/modules/user/domain/services/create.service';
import { FindUser } from '@src/app/modules/user/util/find-user';

describe('CreateForOAuth', () => {
  let service: CreateForOAuth;
  let createUserService: CreateService;
  let findUser: FindUser;
  const mockcreateUserService = { execute: jest.fn() };
  const mockfindUserService = { findAllUsernames: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        CreateForOAuth,
        { provide: FindUser, useValue: mockfindUserService },
        { provide: CreateService, useValue: mockcreateUserService },
      ],
    }).compile();

    service = module.get<CreateForOAuth>(CreateForOAuth);
    createUserService = module.get<CreateService>(CreateService);
    findUser = module.get<FindUser>(FindUser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(createUserService).toBeDefined();
    expect(findUser).toBeDefined();
  });

  // it('should create a user with OAuth', async () => {
  //   const userData: Partial<User> = {
  //     name: 'Test User',
  //     email: 'test@example.com',
  //   };

  //   const userResponse: UserResponse = {
  //     user: {
  //       name: 'Test User',
  //       username: 'TestUser12345',
  //       email: 'test@example.com',
  //       createdAt: new Date(),
  //     },
  //   };

  //   jest.spyOn(findUser, 'findAllUsernames').mockResolvedValue(['asd', 'fdsg']);
  //   jest.spyOn(createUserService, 'execute').mockResolvedValue(userResponse);

  //   const result = await service.execute(userData);

  //   expect(result).toEqual(userResponse);
  //   expect(createUserService.execute).toHaveBeenCalledWith({
  //     name: userData.name,
  //     email: userData.email,
  //     username: expect.any(String),
  //     password: expect.any(String),
  //   });
  // });
});
