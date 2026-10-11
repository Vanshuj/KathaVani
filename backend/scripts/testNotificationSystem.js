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
  console.log('🧪 Starting KathaVani Complete Notification System Verification...\n');
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
    // 1. Unauthenticated request to notifications endpoint returns 401
    const unauthNotifs = await request('GET', '/api/notifications');
    assert(unauthNotifs.status === 401, 'Unauthenticated user rejected with 401 on /api/notifications');

    // 2. Register User A (Story Author)
    const userAEmail = `author_${Date.now()}@kathavani.org`;
    const userARes = await request('POST', '/api/auth/register', {
      name: 'Aarav Author',
      email: userAEmail,
      password: 'password123',
      region: 'Tamil Nadu'
    });
    assert(userARes.status === 201, 'User A (Story Author) registered successfully');
    const userAToken = userARes.body.token;
    const userAId = userARes.body.user._id || userARes.body.user.id;

    // 3. Register User B (Regional Listener & Reviewer)
    const userBEmail = `listener_${Date.now()}@kathavani.org`;
    const userBRes = await request('POST', '/api/auth/register', {
      name: 'Bhavna Listener',
      email: userBEmail,
      password: 'password123',
      region: 'Tamil Nadu'
    });
    assert(userBRes.status === 201, 'User B (Regional Listener) registered successfully');
    const userBToken = userBRes.body.token;
    const userBId = userBRes.body.user._id || userBRes.body.user.id;

    // 4. Admin login
    const adminLoginRes = await request('POST', '/api/admin/auth/login', {
      email: 'admin@kathavani.org',
      password: 'AdminKatha@2024!'
    });
    assert(adminLoginRes.status === 200, 'Admin authenticated successfully');
    const adminToken = adminLoginRes.body.token;

    // 5. Initial notifications state for User A
    const userANotifsInitial = await request('GET', '/api/notifications', null, userAToken);
    assert(userANotifsInitial.status === 200, 'User A can fetch their notifications');
    assert(Array.isArray(userANotifsInitial.body.notifications), 'Returns notifications array');
    const initialCount = userANotifsInitial.body.unreadCount;

    // 6. User A submits a story -> triggers story_submitted to author and admin_new_story to admin
    const newStoryRes = await request('POST', '/api/stories', {
      title: `Folklore of Tanjore ${Date.now()}`,
      content: 'In the ancient corridors of the Brihadeeswarar Temple, bronze bells chimed with rhythmic devotion as sculptors shaped granite into timeless poetry...',
      language: 'Tamil',
      region: 'Tamil Nadu',
      tags: ['temple', 'chola', 'granite']
    }, userAToken);
    assert(newStoryRes.status === 201, 'User A submitted a story for moderation');
    const storyId = newStoryRes.body._id;

    // Check User A's notifications: Should have 'Lore Submitted for Approval'
    const userANotifsAfterSubmit = await request('GET', '/api/notifications', null, userAToken);
    const submissionNotif = userANotifsAfterSubmit.body.notifications.find(n => n.type === 'story_submitted');
    assert(!!submissionNotif, 'Author received "story_submitted" notification');
    assert(userANotifsAfterSubmit.body.unreadCount > initialCount, 'Author unread count incremented');

    // Check Admin's notifications: Should have 'admin_new_story'
    const adminNotifs = await request('GET', '/api/notifications', null, adminToken);
    assert(adminNotifs.status === 200, 'Admin can fetch administrative notifications');
    const adminStoryNotif = adminNotifs.body.notifications.find(n => n.type === 'admin_new_story' && n.metadata?.storyId === storyId);
    assert(!!adminStoryNotif, 'Admin received "admin_new_story" notification for approval queue');

    // 7. User B upvotes the story -> triggers story_voted notification to User A
    const voteRes = await request('POST', `/api/stories/${storyId}/vote`, {}, userBToken);
    assert(voteRes.status === 200, 'User B upvoted the story');
    const userANotifsAfterVote = await request('GET', '/api/notifications', null, userAToken);
    const voteNotif = userANotifsAfterVote.body.notifications.find(n => n.type === 'story_voted');
    assert(!!voteNotif, 'Author received "story_voted" notification (+5 Karma awarded)');

    // 8. User B submits a review -> triggers story_reviewed notification to User A
    const reviewRes = await request('POST', `/api/stories/${storyId}/reviews`, {
      rating: 5,
      comment: 'Breathtaking historical fidelity and atmosphere!'
    }, userBToken);
    assert(reviewRes.status === 200, 'User B submitted a 5-star review');
    const userANotifsAfterReview = await request('GET', '/api/notifications', null, userAToken);
    const reviewNotif = userANotifsAfterReview.body.notifications.find(n => n.type === 'story_reviewed');
    assert(!!reviewNotif, 'Author received "story_reviewed" notification');

    // 9. Admin moderates and approves the story -> triggers story_approved to author and regional_story to User B
    const approveRes = await request('PUT', `/api/admin/stories/${storyId}/moderate`, {
      status: 'approved',
      feedback: 'Excellent preservation of Tamil heritage.'
    }, adminToken);
    assert(approveRes.status === 200, 'Admin approved story and published globally');

    const userANotifsAfterApprove = await request('GET', '/api/notifications', null, userAToken);
    const approvedNotif = userANotifsAfterApprove.body.notifications.find(n => n.type === 'story_approved');
    assert(!!approvedNotif, 'Author received "story_approved" global publication notification');

    const userBNotifsAfterApprove = await request('GET', '/api/notifications', null, userBToken);
    const regionalNotif = userBNotifsAfterApprove.body.notifications.find(n => n.type === 'regional_story');
    assert(!!regionalNotif, 'Regional listener (User B) received "regional_story" notification');

    // 10. Mark single notification as read (PUT /api/notifications/:id/read)
    const notifToRead = approvedNotif;
    const markReadRes = await request('PUT', `/api/notifications/${notifToRead._id}/read`, {}, userAToken);
    assert(markReadRes.status === 200, 'Author marked single notification as read');
    assert(markReadRes.body.notification.isRead === true, 'Notification isRead changed to true');

    // 11. Test filter=unread vs filter=all
    const unreadOnlyRes = await request('GET', '/api/notifications?filter=unread', null, userAToken);
    assert(unreadOnlyRes.status === 200, 'Successfully queried with filter=unread');
    assert(unreadOnlyRes.body.notifications.every(n => n.isRead === false), 'All returned notifications have isRead: false');

    // 12. Mark all as read (PUT /api/notifications/read-all)
    const markAllReadRes = await request('PUT', '/api/notifications/read-all', {}, userAToken);
    assert(markAllReadRes.status === 200, 'Author marked all notifications as read');
    const userANotifsAfterReadAll = await request('GET', '/api/notifications', null, userAToken);
    assert(userANotifsAfterReadAll.body.unreadCount === 0, 'Unread count is now 0');

    // 13. Dismiss / Delete notification (DELETE /api/notifications/:id)
    const deleteNotifRes = await request('DELETE', `/api/notifications/${notifToRead._id}`, null, userAToken);
    assert(deleteNotifRes.status === 200, 'Author dismissed/deleted a notification');
    const userANotifsAfterDelete = await request('GET', '/api/notifications', null, userAToken);
    assert(!userANotifsAfterDelete.body.notifications.some(n => n._id === notifToRead._id), 'Deleted notification is removed');

    // 14. Admin changes user status to suspended -> triggers account_suspended to User B
    const suspendRes = await request('PUT', `/api/admin/users/${userBId}/status`, {
      status: 'suspended',
      reason: 'Testing suspension notification flow'
    }, adminToken);
    assert(suspendRes.status === 200, 'Admin suspended User B account');
    // Note: Suspended users are blocked by authMiddleware, but let's reactivate them to verify notification
    const reactivateRes = await request('PUT', `/api/admin/users/${userBId}/status`, {
      status: 'active',
      reason: 'Restoring user after testing'
    }, adminToken);
    assert(reactivateRes.status === 200, 'Admin restored User B account');

    const userBNotifsAfterRestore = await request('GET', '/api/notifications', null, userBToken);
    const restoredNotif = userBNotifsAfterRestore.body.notifications.find(n => n.type === 'account_restored');
    const suspendedNotif = userBNotifsAfterRestore.body.notifications.find(n => n.type === 'account_suspended');
    assert(!!suspendedNotif, 'User B received "account_suspended" notification with reason');
    assert(!!restoredNotif, 'User B received "account_restored" notification');

    // 15. User account restriction event
    const restrictRes = await request('PUT', `/api/admin/users/${userBId}/restrictions`, {
      restrictedCapabilities: ['submit_story'],
      reason: 'Temporary folklore verification hold'
    }, adminToken);
    assert(restrictRes.status === 200, 'Admin restricted User B capabilities');
    const userBNotifsAfterRestrict = await request('GET', '/api/notifications', null, userBToken);
    const restrictNotif = userBNotifsAfterRestrict.body.notifications.find(n => n.type === 'account_restricted');
    assert(!!restrictNotif, 'User B received "account_restricted" notification');

    // 16. Security check: User A cannot read or delete User B's notification
    const unauthorizedAccessRes = await request('DELETE', `/api/notifications/${restrictNotif._id}`, null, userAToken);
    assert(unauthorizedAccessRes.status === 403, 'Cross-user modification denied with 403');

    // 17. Security check: User A cannot view admin notifications
    assert(!userANotifsAfterDelete.body.notifications.some(n => n.recipientRole === 'admin'), 'Regular user cannot see admin notifications');

    console.log(`\n==========================================`);
    console.log(`🏁 Notification System Tests Complete:`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`==========================================\n`);
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runTests();
