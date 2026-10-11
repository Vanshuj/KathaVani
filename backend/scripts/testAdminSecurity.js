const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting KathaVani Admin Panel Security & Functionality Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Unauthenticated access to admin endpoints is rejected (401)
    const unauthStats = await request('GET', '/api/admin/dashboard/stats');
    assert(unauthStats.status === 401, 'Unauthenticated visitor cannot access admin stats (401)');

    const unauthUsers = await request('GET', '/api/admin/users');
    assert(unauthUsers.status === 401, 'Unauthenticated visitor cannot access admin users list (401)');

    // 2. Regular user registration cannot inject admin role
    const testRegEmail = `tester_${Date.now()}@test.com`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Sneaky User',
      email: testRegEmail,
      password: 'password123',
      role: 'admin' // Attempted privilege escalation
    });
    assert(regRes.status === 201, 'Regular user registration succeeds');
    assert(regRes.body.user.role === 'user', 'Injected role is ignored, user role remains "user"');

    const regularToken = regRes.body.token;

    // 3. Regular user cannot login via admin login endpoint (403)
    const regularAdminLogin = await request('POST', '/api/admin/auth/login', {
      email: testRegEmail,
      password: 'password123'
    });
    assert(regularAdminLogin.status === 403, 'Regular user cannot login via /api/admin/auth/login (403)');

    // 4. Regular user with valid token cannot access admin APIs (403)
    const regStats = await request('GET', '/api/admin/dashboard/stats', null, regularToken);
    assert(regStats.status === 403, 'Regular user token rejected from admin stats (403)');

    const regUsersList = await request('GET', '/api/admin/users', null, regularToken);
    assert(regUsersList.status === 403, 'Regular user token rejected from admin users list (403)');

    // 5. Admin authentication succeeds with valid credentials
    const adminLoginRes = await request('POST', '/api/admin/auth/login', {
      email: 'admin@kathavani.org',
      password: 'AdminKatha@2024!'
    });
    assert(adminLoginRes.status === 200, 'Admin login succeeds with valid credentials (200)');
    assert(adminLoginRes.body.user.role === 'admin', 'Returned user has role "admin"');
    const adminToken = adminLoginRes.body.token;

    // 6. Admin can fetch dashboard stats
    const adminStats = await request('GET', '/api/admin/dashboard/stats', null, adminToken);
    assert(adminStats.status === 200, 'Admin can retrieve dashboard stats (200)');
    assert(typeof adminStats.body.stats.totalUsers === 'number', 'Stats contains totalUsers');
    assert(typeof adminStats.body.stats.totalStories === 'number', 'Stats contains totalStories');

    // 7. Admin can list users
    const usersList = await request('GET', '/api/admin/users?limit=5', null, adminToken);
    assert(usersList.status === 200, 'Admin can list registered users (200)');
    assert(Array.isArray(usersList.body.users), 'Users array returned');

    // 8. Admin cannot suspend or delete themselves
    const selfSuspend = await request('PUT', `/api/admin/users/${adminLoginRes.body.user._id}/status`, { status: 'suspended' }, adminToken);
    assert(selfSuspend.status === 400, 'Admin cannot suspend their own account (400)');

    const selfDelete = await request('DELETE', `/api/admin/users/${adminLoginRes.body.user._id}`, null, adminToken);
    assert(selfDelete.status === 400, 'Admin cannot delete their own account (400)');

    // 9. Admin can suspend regular user
    const regularUserId = regRes.body.user._id;
    const suspendRes = await request('PUT', `/api/admin/users/${regularUserId}/status`, {
      status: 'suspended',
      reason: 'Automated test suspension'
    }, adminToken);
    assert(suspendRes.status === 200, 'Admin can suspend regular user (200)');

    // 10. Suspended regular user is blocked from logging in or using protected endpoints
    const suspendedLogin = await request('POST', '/api/auth/login', {
      email: testRegEmail,
      password: 'password123'
    });
    assert(suspendedLogin.status === 403, 'Suspended user blocked from login (403)');

    const suspendedMe = await request('GET', '/api/auth/me', null, regularToken);
    assert(suspendedMe.status === 403, 'Suspended user token rejected from /me (403)');

    // 11. Admin can reactivate user
    const activateRes = await request('PUT', `/api/admin/users/${regularUserId}/status`, { status: 'active' }, adminToken);
    assert(activateRes.status === 200, 'Admin can reactivate user (200)');

    // 12. Admin can restrict capabilities (e.g. submit_story)
    const restrictRes = await request('PUT', `/api/admin/users/${regularUserId}/restrictions`, {
      restrictedCapabilities: ['submit_story'],
      reason: 'Test story restriction'
    }, adminToken);
    assert(restrictRes.status === 200, 'Admin can restrict capabilities (200)');

    // 13. Restricted user blocked from story submission
    const storySubmitRes = await request('POST', '/api/stories', {
      title: 'Restricted Tale',
      content: 'This story should not be allowed'
    }, regularToken);
    assert(storySubmitRes.status === 403, 'Restricted user blocked from story submission (403)');

    // 14. Admin can moderate stories (Approve/Reject)
    const storiesList = await request('GET', '/api/admin/stories?limit=1', null, adminToken);
    assert(storiesList.status === 200, 'Admin can list stories (200)');
    if (storiesList.body.stories.length > 0) {
      const testStoryId = storiesList.body.stories[0]._id;
      const modRes = await request('PUT', `/api/admin/stories/${testStoryId}/moderate`, {
        status: 'approved',
        reason: 'Automated audit test verification'
      }, adminToken);
      assert(modRes.status === 200, 'Admin can moderate story status (200)');
    }

    // 15. Admin cannot demote the last remaining administrator
    const demoteLastAdmin = await request('PUT', `/api/admin/admins/${adminLoginRes.body.user._id}/demote`, {
      newRole: 'user'
    }, adminToken);
    assert(demoteLastAdmin.status === 400, 'Cannot demote the last remaining administrator (400)');

    // 16. Audit logs recorded
    const logsRes = await request('GET', '/api/admin/logs?limit=10', null, adminToken);
    assert(logsRes.status === 200, 'Admin can retrieve audit logs (200)');
    assert(logsRes.body.logs.length > 0, 'Audit logs contains recorded admin actions');
    console.log(`     Total audit records found: ${logsRes.body.total}`);

    // Cleanup test user
    await request('DELETE', `/api/admin/users/${regularUserId}?permanent=true`, null, adminToken);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
