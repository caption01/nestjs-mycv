import { Test } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';

describe('Auth Service', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdsa@asd.com', 'asdsa123');

    expect(user.password).not.toEqual('asdsa123');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs up with email that is in use', (done) => {
    service.signup('aaa@aaa.com', 'aaa').then(() => {
      service.signup('aaa@aaa.com', 'aaa').catch(() => done());
    });
  });

  it('throw if signin is called with an unused email', (done) => {
    service.signin('aaa@aaa.com', 'aaa').catch(() => done());
  });

  it('throw if an invalid password is provided', (done) => {
    service.signup('asdsa123@asdsa.com', 'asd123213').then(() => {
      service.signin('asdsa123@asdsa.com', 'password').catch(() => done());
    });
  });

  it('return a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');

    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
