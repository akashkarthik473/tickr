const request = require('supertest');

jest.mock('../services/emailService', () => ({
  sendGoalReminder: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

const { app } = require('../server');

describe('Auth routes', () => {
  it('registers a new user and logs in successfully', async () => {
    const email = `testuser-${Date.now()}@example.com`;
    const password = 'Password123!';
    const username = `user${Math.floor(Math.random() * 10000)}`;

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password,
        name: 'Test User',
        username
      })
      .expect(200);

    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.token).toBeDefined();

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: email,
        password
      })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.user.email).toBe(email);
  });
});

describe('Trading routes', () => {
  it('returns websocket status', async () => {
    const response = await request(app)
      .get('/api/trading/websocket-status')
      .expect(200);

    expect(response.body).toMatchObject({
      connected: false,
      authenticated: false
    });
  });
});

