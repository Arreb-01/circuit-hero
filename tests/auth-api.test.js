const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createApp } = require('../server/app');

async function request(baseUrl, method, url, body, cookie) {
  const response = await fetch(baseUrl + url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : null
  };
}

async function main() {
  const dbPath = path.join(os.tmpdir(), `circuit-hero-${Date.now()}.sqlite`);
  const app = createApp({ dbPath });
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const register = await request(baseUrl, 'POST', '/api/auth/register', {
      username: 'luna',
      email: 'luna@example.com',
      password: 'secret123'
    });

    assert.strictEqual(register.status, 201);
    assert.strictEqual(register.body.user.username, 'luna');
    assert.strictEqual(register.body.user.email, 'luna@example.com');
    assert.strictEqual(register.body.user.password_hash, undefined);

    const duplicate = await request(baseUrl, 'POST', '/api/auth/register', {
      username: 'luna',
      email: 'other@example.com',
      password: 'secret123'
    });

    assert.strictEqual(duplicate.status, 409);

    const badLogin = await request(baseUrl, 'POST', '/api/auth/login', {
      username: 'luna',
      password: 'wrong'
    });

    assert.strictEqual(badLogin.status, 401);

    const login = await request(baseUrl, 'POST', '/api/auth/login', {
      username: 'luna',
      password: 'secret123'
    });

    assert.strictEqual(login.status, 200);
    const cookie = login.headers.get('set-cookie');
    assert.ok(cookie && cookie.includes('ch_session='));

    const me = await request(baseUrl, 'GET', '/api/me', null, cookie);
    assert.strictEqual(me.status, 200);
    assert.strictEqual(me.body.user.username, 'luna');

    const saveProgress = await request(baseUrl, 'POST', '/api/progress', {
      levelId: '1-1',
      stars: 3,
      elapsed: 90,
      usedHint: false
    }, cookie);

    assert.strictEqual(saveProgress.status, 200);
    assert.deepStrictEqual(saveProgress.body, {
      levelId: '1-1',
      completed: true,
      stars: 3,
      bestTime: 90,
      usedHint: false
    });

    const lowerReplay = await request(baseUrl, 'POST', '/api/progress', {
      levelId: '1-1',
      stars: 1,
      elapsed: 120,
      usedHint: true
    }, cookie);

    assert.strictEqual(lowerReplay.status, 200);
    assert.strictEqual(lowerReplay.body.stars, 3);
    assert.strictEqual(lowerReplay.body.bestTime, 90);

    const progress = await request(baseUrl, 'GET', '/api/progress', null, cookie);
    assert.strictEqual(progress.status, 200);
    assert.deepStrictEqual(progress.body.levels['1-1'], {
      completed: true,
      stars: 3,
      bestTime: 90,
      usedHint: false
    });

    console.log('auth-api tests passed');
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (app.locals.db) app.locals.db.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
