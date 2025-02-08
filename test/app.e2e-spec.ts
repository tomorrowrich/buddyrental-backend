import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Test for Create User
  it('should create a new user (POST /users)', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password123',
      age: 30,
      role: 'USER',
    };

    const response = await request(app.getHttpServer())
      .post('/users') // Endpoint สำหรับการสร้างผู้ใช้
      .send(newUser)
      .expect(201); // คาดหวังสถานะ 201 Created

    // ตรวจสอบว่า response body มีข้อมูลผู้ใช้ที่ถูกต้อง
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.email).toBe(newUser.email);
    expect(response.body.age).toBe(newUser.age);
    expect(response.body.role).toBe(newUser.role);
  });

  // Test for Update User
  it('should update an existing user (PUT /users/:id)', async () => {
    const updatedData = {
      displayName: 'John Updated',
      description: 'I love coding and coffee.',
      profilePicture: 'https://example.com/profile.jpg',
      address: '123 Main Street',
      phoneNumber: '0123456789',
    };

    const userId = 1; // สมมุติว่า user ID คือ 1

    const response = await request(app.getHttpServer())
      .put(`/users/${userId}`) // Endpoint สำหรับการอัปเดตข้อมูลผู้ใช้
      .send(updatedData)
      .expect(200); // คาดหวังสถานะ 200 OK

    // ตรวจสอบว่า response body มีข้อมูลที่ถูกอัปเดต
    expect(response.body.displayName).toBe(updatedData.displayName);
    expect(response.body.description).toBe(updatedData.description);
    expect(response.body.profilePicture).toBe(updatedData.profilePicture);
    expect(response.body.address).toBe(updatedData.address);
    expect(response.body.phoneNumber).toBe(updatedData.phoneNumber);
  });

  afterEach(async () => {
    await app.close();
  });
});
