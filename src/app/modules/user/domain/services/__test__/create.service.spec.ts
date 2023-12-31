import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateService } from '@src/app/modules/user/domain/services/create.service';
import { HashPassword } from '@src/app/modules/user/domain/services/util/hash-password';
import { getQueueToken } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { UserCreatedEvent } from '@src/app/common/events/user-created-event';

describe('CreateService', () => {
  let service: CreateService, hashPassword: HashPassword, usersQueue: Queue;

  const eventEmitterMock = {
    once: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    usersQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateService,
        HashPassword,
        { provide: EventEmitter2, useValue: eventEmitterMock },
        {
          provide: getQueueToken('users'),
          useValue: usersQueue,
        },
      ],
    }).compile();

    service = module.get<CreateService>(CreateService);
    hashPassword = module.get<HashPassword>(HashPassword);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user and emit an event', async () => {
    const userData = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
    };

    jest.spyOn(usersQueue, 'add').mockResolvedValue(null as any);
    eventEmitterMock.once.mockImplementation((event, callback) => {
      if (event === 'user.created') {
        callback();
      }
    });
    jest.spyOn(hashPassword, 'hash').mockResolvedValue('hashedpassword');
    const result = await service.execute(userData);

    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result).toEqual({
      user: { ...userData, password: undefined, createdAt: expect.any(Date) },
    });
    expect(hashPassword.hash).toHaveBeenCalledWith('password123');
    expect(usersQueue.add).toHaveBeenCalledWith(
      'user.creating',
      expect.any(UserCreatedEvent)
    );
    expect(eventEmitterMock.once).toHaveBeenCalledWith(
      'user.created',
      expect.any(Function)
    );
  });

  it('should create a user and emit an event', async () => {
    const userData = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
    };

    jest.spyOn(usersQueue, 'add').mockResolvedValue(null as any);

    eventEmitterMock.emit('user.created.failed', {
      message: 'duplicate key',
    });

    eventEmitterMock.once.mockImplementation((event, callback) => {
      if (event === 'user.created.failed') {
        callback();
      }
      throw new Error('duplicate key');
    });

    jest.spyOn(hashPassword, 'hash').mockResolvedValue('hashedpassword');

    await expect(service.execute(userData)).rejects.toThrow(BadRequestException);
    expect(hashPassword.hash).toHaveBeenCalledWith('password123');
    expect(usersQueue.add).toHaveBeenCalledWith(
      'user.creating',
      expect.any(UserCreatedEvent)
    );
  });
});
