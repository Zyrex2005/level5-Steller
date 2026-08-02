import request from 'supertest';
import app from '../src/server';

describe('SkillEscrow Backend API', () => {
  it('GET /health should return ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });

  it('GET /api/stats should return aggregated growth & funnel metrics', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('uniqueWalletsCount');
    expect(res.body).toHaveProperty('funnelMetrics');
    expect(res.body.funnelMetrics).toHaveProperty('connectConversion');
  });

  it('GET /api/jobs should filter jobs by category', async () => {
    const res = await request(app).get('/api/jobs?category=Development');
    expect(res.statusCode).toEqual(200);
    expect(res.body.jobs).toBeInstanceOf(Array);
    expect(res.body.jobs.length).toBeGreaterThan(0);
    expect(res.body.jobs[0].category).toEqual('Development');
  });

  it('POST /api/analytics/event should record pseudonymous wallet events', async () => {
    const res = await request(app)
      .post('/api/analytics/event')
      .send({
        event: 'wallet_connect',
        walletAddress: 'GCAB1234567890XYZW'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.record.walletAddress).toEqual('GCAB...XYZW');
  });
});
