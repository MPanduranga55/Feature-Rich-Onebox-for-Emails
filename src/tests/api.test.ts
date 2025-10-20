import { expect } from 'chai';
import request from 'supertest';
import app from '../app';

describe('API', () => {
  it('GET /account', async () => {
    const res = await request(app).get('/account');
    expect(res.status).to.equal(200);
  });
});
