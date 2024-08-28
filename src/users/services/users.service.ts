import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { CreateUserDto } from '../../auth/controllers/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { AssignUserDto } from '../controllers/dto/assign-role.dto';
import { UserErrorMessage } from '../../constants/users.constants';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repository: Repository<User>) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.repository.findOne({
      where: {
        email,
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await this.encryptPassword(createUserDto.password);
    const user: User = await this.repository.create(createUserDto);
    return await this.repository.save(user);
  }

  async encryptPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async assignRole(
    userId: number,
    assignUserDto: AssignUserDto,
  ): Promise<User> {
    const user = await this.repository.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new NotFoundException(UserErrorMessage.USER_DOES_NOT_EXIST);
    }
    user.role = assignUserDto.role;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = await this.repository.save(user);
    return rest as User;
  }

  async getAll(options: IPaginationOptions): Promise<Pagination<User>> {
    const result = await paginate<User>(this.repository, options);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newItems = result.items.map(({ password, ...rest }) => rest as User);
    return new Pagination<User>(newItems, result.meta, result.links);
  }
}
