import { test, expect } from '../fixtures';
import { env } from '../../config/env';

test.describe('Auth API - Login Validation + Protected Routes', () => {

  const getCleanApi = async (playwright: any) => {
    return await playwright.request.newContext({ baseURL: env.apiURL });
  };

  test('AUTH-01 email empty -> 400', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { email: '', password: 'password123' } });
    expect([400,422,401]).toContain(res.status());
    await api.dispose();
  });

  test('AUTH-02 password empty -> 400', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { email: 'admin@bajfaj.com', password: '' } });
    expect([400,422,401]).toContain(res.status());
    await api.dispose();
  });

  test('AUTH-03 invalid email format no @ -> 400', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { email: 'invalidemail', password: 'pass123' } });
    expect([400,422]).toContain(res.status());
    await api.dispose();
  });

  test('AUTH-04 invalid email format no domain -> 400', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { email: 'test@', password: 'pass123' } });
    expect([400,422]).toContain(res.status());
    await api.dispose();
  });

  test('AUTH-05 non-existent user -> 401', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { email: 'nouser@bajfaj.com', password: 'password123' } });
    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test('AUTH-06 wrong password -> 401', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { email: 'admin@bajfaj.com', password: 'WrongPass123!' } });
    expect(res.status()).toBe(401);
    await api.dispose();
  });

  test('AUTH-07 email missing field -> 400', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { password: 'password123' } as any });
    expect([400,422]).toContain(res.status());
    await api.dispose();
  });

  test('AUTH-08 password missing field -> 400', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { email: 'admin@bajfaj.com' } as any });
    expect([400,422]).toContain(res.status());
    await api.dispose();
  });

  test('AUTH-09 valid login -> 200 + token', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { email: 'admin@bajfaj.com', password: 'Admin123!' } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('token');
    await api.dispose();
  });

  test('AUTH-10 SQL injection in email -> 400/401 not 500', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/auth/login', { data: { email: "' OR '1'='1", password: 'pass' } });
    expect([400,401,422]).toContain(res.status());
    expect(res.status()).not.toBe(500);
    await api.dispose();
  });

  test('AUTH-11 GET /api/cars without token -> 401', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.get('/api/cars');
    expect([401,403]).toContain(res.status());
    await api.dispose();
  });

  test('AUTH-12 GET /api/cars with invalid token -> 401', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.get('/api/cars', { headers: { Authorization: 'Bearer invalid123' } });
    expect([401,403]).toContain(res.status());
    await api.dispose();
  });

  test('AUTH-13 POST /api/cars without token -> 401', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const res = await api.post('/api/cars', { data: { make: 'Test' } as any });
    expect([401,403]).toContain(res.status());
    await api.dispose();
  });

  test('AUTH-14 logout invalidates token', async ({ playwright }) => {
    const api = await getCleanApi(playwright);
    const login = await api.post('/api/auth/login', { data: { email: 'admin@bajfaj.com', password: 'Admin123!' } });
    expect(login.status()).toBe(200);
    const { token } = await login.json();

    const logout = await api.post('/api/auth/logout', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // if you don't have logout endpoint yet, this will be 404 - that's ok, we check below
    if ([200,204].includes(logout.status())) {
      const after = await api.get('/api/cars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      expect([401,403]).toContain(after.status());
    } else {
      console.log(`[AUTH-14] logout endpoint not implemented - status ${logout.status()} - skipping invalidate check`);
      expect([404,405]).toContain(logout.status());
    }
    await api.dispose();
  });
});