import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/models/user.entity';
import { UserRole } from '../../src/constants/users.constants';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  const mockUser = {
    id: '2',
    firstName: 'Martin',
    lastName: 'Perez',
    email: 'martin.perez@sundevs.com',
    role: UserRole.ADMIN,
    createAt: '2024-08-27T06:14:15.051Z',
    updateAt: '2024-08-27T09:44:23.399Z',
    deletedAt: null,
  };

  const mockUserRepository = {
    find: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockUser);
    }),
    findOneBy: jest.fn().mockImplementation(() => {
      return Promise.resolve(mockUser);
    }),
    save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        UsersModule,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        stopAtFirstError: true,
      }),
    );
    await app.init();
  });

  async function getValidToken() {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@demo.com',
        password: 'password',
      });

    return response.body.access_token;
  }

  it('/api/users (GET)', async () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .auth(await getValidToken(), { type: 'bearer' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect([mockUser]);
  });

  it('/api/users (GET) should fail because of an invalid user role', async () => {
    mockUserRepository.findOne.mockResolvedValueOnce({
      id: 2,
      email: 'guest@demo.com',
      role: 'guest',
    });

    return request(app.getHttpServer())
      .get('/api/users')
      .auth(await getValidToken(), { type: 'bearer' })
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  it('/api/users/assign-role/:id (POST)', async () => {
    return request(app.getHttpServer())
      .post('/api/users/assign-role/2')
      .auth(await getValidToken(), { type: 'bearer' })
      .send({ role: UserRole.AGENT })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect({ ...mockUser, role: UserRole.AGENT });
  });

  it('/api/users/assign-role/:id (POST) should fail because user not found', async () => {
    mockUserRepository.findOneBy.mockResolvedValueOnce(null);

    return request(app.getHttpServer())
      .post('/api/users/assign-role/999')
      .auth(await getValidToken(), { type: 'bearer' })
      .send({ role: UserRole.AGENT })
      .expect(404)
      .expect('Content-Type', /application\/json/)
      .expect({
        statusCode: 404,
        message: 'User does not exist',
        error: 'Not Found',
      });
  });

  it('/api/users/assign-role/:id (POST) should fail because of an invalid user role', async () => {
    mockUserRepository.findOne.mockResolvedValueOnce({
      id: 2,
      email: 'guest@demo.com',
      role: 'guest',
    });

    return request(app.getHttpServer())
      .post('/api/users/assign-role/2')
      .auth(await getValidToken(), { type: 'bearer' })
      .send({ role: UserRole.AGENT })
      .expect(403)
      .expect('Content-Type', /application\/json/);
  });

  it('/api/users/assign-role/:id (POST) should fail because of missing parameters', async () => {
    return request(app.getHttpServer())
      .post('/api/users/assign-role/2')
      .auth(await getValidToken(), { type: 'bearer' })
      .send({})
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });
});
