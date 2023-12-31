import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { FindUser } from '@src/app/modules/user/util/find-user';
import { mockCacheManager } from '@src/app/common/constants/mock-cache';

const mockUserModel = {
  findOne: jest.fn(),
};

describe('FindUser', () => {
  let findUser: FindUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUser,
        {
          provide: getModelToken('UserModel'),
          useValue: mockUserModel,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    findUser = module.get<FindUser>(FindUser);
  });

  describe('findOne', () => {
    it('should find a user by email', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockUserModel.findOne.mockResolvedValue(user);
      mockCacheManager.get.mockResolvedValue(null);

      const result = await findUser.findOne('test@example.com');

      expect(result).toEqual(user);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(mockCacheManager.get).toHaveBeenCalledWith('user:test@example.com');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'user:test@example.com',
        result,
        expect.any(Number)
      );
    });

    it('should find a user by username', async () => {
      const user = {
        id: '2',
        username: 'testuser',
        email: 'test@example.com',
      };
      mockUserModel.findOne.mockResolvedValue(user);
      mockCacheManager.get.mockResolvedValue(null);

      const result = await findUser.findOne('testuser');

      expect(result).toEqual(user);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        username: 'testuser',
      });
      expect(mockCacheManager.get).toHaveBeenCalledTimes(0);
      expect(mockCacheManager.set).toHaveBeenCalledTimes(0);
    });

    it('should return cached user data if available', async () => {
      const user = { id: '3', email: 'cached@example.com' };
      mockUserModel.findOne.mockResolvedValue(user);
      mockCacheManager.get.mockResolvedValue(user);

      const result = await findUser.findOne('cached@example.com');

      expect(result).toEqual(user);
      expect(mockUserModel.findOne).not.toHaveBeenCalled();
      expect(mockCacheManager.get).toHaveBeenCalledWith('user:cached@example.com');
    });
  });

  describe('isEmail', () => {
    it('should return true for a valid email', () => {
      const validEmail = 'test@example.com';
      const result = findUser.isEmail(validEmail);
      expect(result).toBeTruthy();
    });

    it('should return false for an invalid email', () => {
      const invalidEmail = 'invalid-email';
      const result = findUser.isEmail(invalidEmail);
      expect(result).toBeFalsy();
    });
  });
});
