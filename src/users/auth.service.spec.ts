import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string, name: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
          name,
        } as User;

        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup(
      'asdasd@asdad.com',
      'asdad',
      'removernome',
    );
    expect(user.password).not.toEqual('asdad');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs up with email that is in use', async () => {
    await service.signup('a', 'asda', 'asd');

    // Verificando se a função signup rejeita com um erro quando o email já está em uso
    await expect(service.signup('a', 'asda', 'asd')).rejects.toThrow(
      BadRequestException,
    );

    // Configurando o mock para retornar uma lista vazia (email não está em uso)
    fakeUsersService.find = () => Promise.resolve([]);

    // Verificando se a função signup funciona corretamente com um email novo
    await expect(
      service.signup('new@email.com', 'password', 'name'),
    ).resolves.not.toThrow();
  });

  it('throws if sigin is called with an unused email', async () => {
    fakeUsersService.find = () => Promise.resolve([]);

    // Verificando se a função signin lança um erro quando o email não está cadastrado
    await expect(
      service.signin('unused@email.com', 'password'),
    ).rejects.toThrow(NotFoundException);
  });

  it('trhow if an invalid password is provided', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     { email: 'a', password: 'asd', name: 'asdada' } as User,
    //   ]);

    await service.signup('asda@asd.com', 'password1', 'asd');

    await expect(service.signin('asda@asd.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     {
    //       email: 'maya@gmail.com',
    //       password:
    //         'cc292b9c10cfc822.fccc2272bfc423985d4321f090354d38e4015e4f991ee57e28e63f476848c97c',
    //       name: 'maya',
    //     } as User,
    //   ]);
    const user = await service.signup('maya@gmail.com', '12', 'maya');
    console.log(user);

    await service.signin('maya@gmail.com', '12');

    expect(user).toBeDefined();
  });
});
