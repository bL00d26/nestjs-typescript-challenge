import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../constants/users.constants';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({
    example: 'Martin',
  })
  @Column({
    name: 'first_name',
    type: 'char',
    length: 40,
    nullable: true,
  })
  firstName: string;

  @ApiProperty({
    example: 'Perez',
  })
  @Column({
    name: 'last_name',
    type: 'char',
    length: 40,
    nullable: true,
  })
  lastName: string;

  @ApiProperty({
    example: 'martin.perez@sundevs.com',
  })
  @Column({
    name: 'email',
    type: 'char',
    length: 40,
    unique: true,
    nullable: true,
  })
  email: string;

  @Column({
    name: 'password',
    type: 'char',
    length: 80,
    nullable: false,
  })
  password: string;

  @ApiProperty({
    example: 'admin',
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.GUEST,
  })
  role: UserRole;

  @ApiProperty({
    example: '2024-08-27T06:14:15.051Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: null,
  })
  createAt: Date;

  @ApiProperty({
    example: '2024-08-27T06:14:15.051Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: null,
  })
  updateAt: Date;

  @ApiProperty({
    example: null,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    default: null,
  })
  deletedAt: Date;
}
