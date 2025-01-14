import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string, name: string) {
    // see if email is in use
    const hasUser = await this.usersService.find(email);
    if (hasUser.length) {
      throw new BadRequestException('Email in use!');
    }
    // hash the users password
    // generate salt and password together
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');
    // create a new user and save it
    const user = await this.usersService.create(email, result, name);
    // return user
    return user;
  }

  signin() {}
}
