import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Query,
  Delete,
  NotFoundException,
  Session,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from 'src/users/dtos/user.dto';
import { AuthService } from './auth.service';

export interface SigninDto {
  email: string;
  password: string;
}

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authsService: AuthService,
  ) {}

  @Get('/colors/:color')
  setColor(@Param('color') color: string, @Session() session: any) {
    session.color = color;
  }

  @Get('/colors')
  getColor(@Session() session: any) {
    return session.color;
  }

  @Post('/signup')
  createUser(@Body() body: CreateUserDto) {
    console.log('body', body);
    return this.authsService.signup(body.email, body.password, body.name);
  }

  @Post('/signin')
  signin(@Body() body: SigninDto) {
    return this.authsService.signin(body.email, body.password);
  }

  // @UseInterceptors(new SerializeInterceptor(UserDto))
  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get('')
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }
}
