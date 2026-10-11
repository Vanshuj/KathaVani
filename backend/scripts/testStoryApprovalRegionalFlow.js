const API_BASE = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 Starting KathaVani Story Approval & Regional Visibility Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate / Register Test Users in different regions
    console.log('1️⃣ Setting up test users in distinct cultural regions...');
    const timestamp = Date.now();
    
    // User A in Karnataka
    const userARes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: `Kaveri Teller ${timestamp}`,
        email: `karnataka_${timestamp}@test.com`,
        password: 'password123',
        language: 'Kannada',
        region: 'Karnataka'
      }
    });
    const tokenA = userARes.data.token;
    assert(tokenA, 'Registered User A in Karnataka');

    // User B in North India
    const userBRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: `Delhi Listener ${timestamp}`,
        email: `north_${timestamp}@test.com`,
        password: 'password123',
        language: 'Hindi',
        region: 'North India'
      }
    });
    const tokenB = userBRes.data.token;
    assert(tokenB, 'Registered User B in North India');

    // User C in Karnataka (same region as User A)
    const userCRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: `Mysore Peer ${timestamp}`,
        email: `peer_karnataka_${timestamp}@test.com`,
        password: 'password123',
        language: 'Kannada',
        region: 'Karnataka'
      }
    });
    const tokenC = userCRes.data.token;
    assert(tokenC, 'Registered User C in Karnataka (same region as User A)');

    // Admin login
    const adminRes = await request('/admin/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@kathavani.org',
        password: 'AdminKatha@2024!'
      }
    });
    const adminToken = adminRes.data.token;
    assert(adminToken, 'Admin authenticated successfully');

    // 2. User A submits a Karnataka folk tale
    console.log('\n2️⃣ User A submitting folklore for Karnataka region...');
    const storySubmitRes = await request('/stories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        title: `The Whispering Banyan of Hampi ${timestamp}`,
        content: 'Long ago in the Vijayanagara realm, under the ancient banyan tree...',
        language: 'Kannada',
        region: 'Karnataka',
        tags: ['folklore', 'Vijayanagara', 'Hampi']
      }
    });
    const story = storySubmitRes.data;
    const storyId = story._id;
    assert(story.moderationStatus === 'pending', 'Story moderationStatus defaulted to "pending"');
    assert(story.isModerated === false, 'Story isModerated defaulted to false');

    // 3. Test Regional Visibility:
    console.log('\n3️⃣ Verifying regional access restrictions for pending story...');

    // (a) Author (User A) should see it in stories list
    const userAStories = await request('/stories', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const foundByAuthor = (userAStories.data.stories || []).some(s => s._id === storyId);
    assert(foundByAuthor, 'Story author (User A) can view their pending story in feed');

    // (b) User C (same region: Karnataka) should see it in feed
    const userCStories = await request('/stories', {
      headers: { Authorization: `Bearer ${tokenC}` }
    });
    const foundByRegionalPeer = (userCStories.data.stories || []).some(s => s._id === storyId);
    assert(foundByRegionalPeer, 'User C in same region (Karnataka) CAN view the pending story in feed');

    // (c) User C (Karnataka) can access story details directly
    const userCDetail = await request(`/stories/${storyId}`, {
      headers: { Authorization: `Bearer ${tokenC}` }
    });
    assert(userCDetail.data.title === story.title, 'User C in same region can fetch story details directly');

    // (d) User B (North India) should NOT see it in feed
    const userBStories = await request('/stories', {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const foundByOtherRegion = (userBStories.data.stories || []).some(s => s._id === storyId);
    assert(!foundByOtherRegion, 'User B in DIFFERENT region (North India) CANNOT view pending story in feed');

    // (e) User B (North India) direct fetch should return 403 Forbidden
    const userBDetail = await request(`/stories/${storyId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(userBDetail.status === 403, 'User B in DIFFERENT region is blocked with 403 when trying to fetch pending story directly');

    // (f) Guest (unauthenticated visitor) should NOT see it in feed
    const guestStories = await request('/stories');
    const foundByGuest = (guestStories.data.stories || []).some(s => s._id === storyId);
    assert(!foundByGuest, 'Guest (unauthenticated) CANNOT view pending story in feed');

    // (g) Guest direct fetch should return 403 Forbidden
    const guestDetail = await request(`/stories/${storyId}`);
    assert(guestDetail.status === 403, 'Guest is blocked with 403 when trying to fetch pending story directly');

    // 4. Admin Editorial Review & Moderation
    console.log('\n4️⃣ Admin reviews story: saving feedback and approving globally...');
    
    // (a) Admin sees story in admin stories console
    const adminStories = await request('/admin/stories', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundByAdmin = (adminStories.data.stories || []).some(s => s._id === storyId);
    assert(foundByAdmin, 'Administrator sees pending story in admin console');

    // (b) Admin saves review notes while keeping pending
    const reviewSaveRes = await request(`/admin/stories/${storyId}/moderate`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'pending',
        feedback: 'Vivid imagery of Vijayanagara architecture. Ensure regional dialect terms are preserved.',
        improvementSuggestions: 'Add historical footnote about the Tungabhadra river banks.'
      }
    });
    assert(reviewSaveRes.data.story.adminFeedback.includes('Vijayanagara'), 'Admin feedback saved successfully');
    assert(reviewSaveRes.data.story.adminReviews.length >= 1, 'Review record appended to adminReviews history');

    // (c) Admin approves story for global publication
    const approveRes = await request(`/admin/stories/${storyId}/moderate`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'approved',
        feedback: 'Approved for global archive publication. Exceptional cultural resonance.',
        improvementSuggestions: 'None, ready for global audience.'
      }
    });
    assert(approveRes.data.story.moderationStatus === 'approved', 'Story moderationStatus is now "approved"');
    assert(approveRes.data.story.isModerated === true, 'Story isModerated is now true');

    // 5. Verify Global Publication
    console.log('\n5️⃣ Verifying global publication across all users & visitors...');

    // (a) User B (North India) can NOW see the story in feed
    const userBAfterApprove = await request('/stories', {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const foundByBAfter = (userBAfterApprove.data.stories || []).some(s => s._id === storyId);
    assert(foundByBAfter, 'User B in North India CAN NOW view the approved story in feed (Global Release)');

    // (b) User B direct fetch succeeds
    const userBDetailAfter = await request(`/stories/${storyId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(userBDetailAfter.data.title === story.title, 'User B can now read full story directly');

    // (c) Guest (unauthenticated) can NOW view the story
    const guestAfterApprove = await request('/stories');
    const foundByGuestAfter = (guestAfterApprove.data.stories || []).some(s => s._id === storyId);
    assert(foundByGuestAfter, 'Unauthenticated guest CAN NOW view the approved story in public lounge');

    const guestDetailAfter = await request(`/stories/${storyId}`);
    assert(guestDetailAfter.data.title === story.title, 'Guest can now read full story manuscript');

    // 6. Test Admin Rejection flow with rejection reason
    console.log('\n6️⃣ Testing Rejection flow with rejectionReason and review history...');
    const rejectStoryRes = await request('/stories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: {
        title: `Rejected Test Story ${timestamp}`,
        content: 'Brief content that fails authenticity standard...',
        language: 'Hindi',
        region: 'North India',
        tags: ['test']
      }
    });
    const rejectStoryId = rejectStoryRes.data._id;

    const rejectActionRes = await request(`/admin/stories/${rejectStoryId}/moderate`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'rejected',
        rejectionReason: 'Content lacks sufficient historical context and verified source references.',
        feedback: 'Please expand on verified folklore sources.',
        improvementSuggestions: 'Consult elder archives before resubmission.'
      }
    });
    console.log('Story returned from reject action:', JSON.stringify({
      moderationStatus: rejectActionRes.data.story?.moderationStatus,
      rejectionReason: rejectActionRes.data.story?.rejectionReason,
      moderationReason: rejectActionRes.data.story?.moderationReason,
      adminFeedback: rejectActionRes.data.story?.adminFeedback,
      adminReviews: rejectActionRes.data.story?.adminReviews
    }, null, 2));
    assert(rejectActionRes.data.story.moderationStatus === 'rejected', 'Story moderationStatus set to "rejected"');
    assert((rejectActionRes.data.story.rejectionReason || '').includes('sufficient historical context'), 'Rejection reason saved correctly');
    assert(rejectActionRes.data.story.adminReviews.length >= 1, 'Rejection review entry logged in review history');

    // Rejected story is NOT visible in public feed
    const guestFeedTest = await request('/stories');
    const foundRejected = (guestFeedTest.data.stories || []).some(s => s._id === rejectStoryId);
    assert(!foundRejected, 'Rejected story is NOT visible to public users');

    console.log(`\n==================================================`);
    console.log(`🎯 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`==================================================\n`);

  } catch (err) {
    console.error('💥 Test execution error:', err.message);
    failed++;
  }
}

runTests();
