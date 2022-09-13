import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    const users = await this.usersService.find(email);

    if (users.length > 0) {
      throw new BadRequestException('email in used');
    }

    // Hash the user password
    // generate a salt
    const salt = randomBytes(8).toString('hex');

    // hash the salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // join hash and result
    const result = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const user = await this.usersService.create(email, result);

    // return user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('incorrect password');
    }

    return user;
  }
}
