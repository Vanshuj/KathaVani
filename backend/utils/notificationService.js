const { v4: uuidv4 } = require('uuid');
const { getStore, isMongoMode } = require('../config/db');

const getNotificationModel = () => isMongoMode() ? require('../models/Notification') : null;
const getUserModel = () => isMongoMode() ? require('../models/User') : null;

/**
 * Base helper to create a persistent notification and broadcast via socket
 */
const createNotification = async ({
  recipient = null,
  recipientRole = 'user',
  title,
  message,
  type = 'system',
  link = null,
  metadata = {},
  io = null
}) => {
  try {
    const cleanRecipient = recipient ? recipient.toString() : null;

    // Deduplication check: prevent identical notification within last 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10000);

    if (isMongoMode()) {
      const Notification = getNotificationModel();
      const existing = await Notification.findOne({
        recipient: cleanRecipient,
        recipientRole,
        type,
        title,
        createdAt: { $gte: tenSecondsAgo }
      });
      if (existing) return existing;

      const notif = await Notification.create({
        recipient: cleanRecipient,
        recipientRole,
        title,
        message,
        type,
        link,
        metadata,
        isRead: false
      });

      if (io) {
        if (cleanRecipient) {
          io.emit(`notification-${cleanRecipient}`, notif);
        }
        if (recipientRole === 'admin') {
          io.emit('admin-notification', notif);
        }
        io.emit('notification-update', { recipient: cleanRecipient, recipientRole });
      }

      return notif;
    }

    // In-memory mode
    const store = getStore();
    store.notifications = store.notifications || [];

    const existingMem = store.notifications.find(n =>
      (n.recipient ? n.recipient.toString() : null) === cleanRecipient &&
      n.recipientRole === recipientRole &&
      n.type === type &&
      n.title === title &&
      new Date(n.createdAt) >= tenSecondsAgo
    );
    if (existingMem) return existingMem;

    const notifMem = {
      _id: `notif-${uuidv4()}`,
      recipient: cleanRecipient,
      recipientRole,
      title,
      message,
      type,
      link,
      metadata,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    store.notifications.unshift(notifMem);

    if (io) {
      if (cleanRecipient) {
        io.emit(`notification-${cleanRecipient}`, notifMem);
      }
      if (recipientRole === 'admin') {
        io.emit('admin-notification', notifMem);
      }
      io.emit('notification-update', { recipient: cleanRecipient, recipientRole });
    }

    return notifMem;
  } catch (err) {
    console.error('Notification creation error:', err.message);
    return null;
  }
};

/**
 * 1. Story submission notifications:
 * - Notify author that story is received and awaiting regional approval
 * - Notify admins that a new story was submitted
 */
const notifyStorySubmitted = async (story, authorUser, io = null) => {
  const authorId = authorUser._id || authorUser.id || story.author;

  // Author notification
  await createNotification({
    recipient: authorId,
    recipientRole: 'user',
    title: 'Lore Submitted for Approval',
    message: `Your manuscript "${story.title}" has been submitted. It is currently visible exclusively to listeners in ${story.region || 'your region'} pending global administrative approval.`,
    type: 'story_submitted',
    link: `/stories/${story._id}`,
    metadata: { storyId: story._id, region: story.region, moderationStatus: 'pending' },
    io
  });

  // Admin notification
  await createNotification({
    recipient: null,
    recipientRole: 'admin',
    title: 'New Story Submission for Approval',
    message: `"${story.title}" was submitted by ${authorUser?.name || story.authorName || 'a storyteller'} from ${story.region || 'Pan India'}.`,
    type: 'admin_new_story',
    link: `/admin/stories?status=pending`,
    metadata: { storyId: story._id, authorName: authorUser?.name || story.authorName, region: story.region },
    io
  });
};

/**
 * 2. Story approved and published globally
 */
const notifyStoryApproved = async (story, adminUser, feedback = '', io = null) => {
  const authorId = story.author?._id || story.author;

  // Notify author
  await createNotification({
    recipient: authorId,
    recipientRole: 'user',
    title: 'Story Approved & Published Globally! 🎉',
    message: `Congratulations! "${story.title}" has been approved by ${adminUser?.name || 'Administrator'} and is now published worldwide across all regions.`,
    type: 'story_approved',
    link: `/stories/${story._id}`,
    metadata: { storyId: story._id, feedback, moderationStatus: 'approved' },
    io
  });

  // Notify eligible regional listeners about new verified lore
  try {
    if (isMongoMode()) {
      const User = getUserModel();
      const regionalUsers = await User.find({
        region: story.region,
        _id: { $ne: authorId },
        isDeleted: { $ne: true },
        status: 'active'
      }).limit(10).select('_id');

      for (const u of regionalUsers) {
        await createNotification({
          recipient: u._id,
          recipientRole: 'user',
          title: `New Folklore from ${story.region}`,
          message: `Explore "${story.title}", newly published in your cultural region.`,
          type: 'regional_story',
          link: `/stories/${story._id}`,
          metadata: { storyId: story._id, region: story.region },
          io
        });
      }
    } else {
      const store = getStore();
      const regionalUsers = (store.users || []).filter(u =>
        u.region === story.region &&
        u._id !== authorId &&
        !u.isDeleted &&
        u.status === 'active'
      ).slice(0, 10);

      for (const u of regionalUsers) {
        await createNotification({
          recipient: u._id,
          recipientRole: 'user',
          title: `New Folklore from ${story.region}`,
          message: `Explore "${story.title}", newly published in your cultural region.`,
          type: 'regional_story',
          link: `/stories/${story._id}`,
          metadata: { storyId: story._id, region: story.region },
          io
        });
      }
    }
  } catch (err) {
    console.error('Regional listeners notification error:', err.message);
  }
};

/**
 * 3. Story rejected with admin review notes and reason
 */
const notifyStoryRejected = async (story, adminUser, reason = '', feedback = '', suggestions = '', io = null) => {
  const authorId = story.author?._id || story.author;

  let msg = `Your submission "${story.title}" was reviewed and not approved for the archive.`;
  if (reason) msg += ` Reason: ${reason}.`;
  if (suggestions) msg += ` Suggestions: ${suggestions}.`;

  await createNotification({
    recipient: authorId,
    recipientRole: 'user',
    title: 'Story Submission Status: Rejected',
    message: msg,
    type: 'story_rejected',
    link: `/stories/${story._id}`,
    metadata: { storyId: story._id, reason, feedback, suggestions, moderationStatus: 'rejected' },
    io
  });
};

/**
 * 4. Admin added or updated review feedback
 */
const notifyStoryFeedback = async (story, adminUser, feedback = '', suggestions = '', io = null) => {
  const authorId = story.author?._id || story.author;

  let msg = `An administrator left editorial guidance on "${story.title}".`;
  if (feedback) msg += ` Feedback: ${feedback}`;
  if (suggestions) msg += ` Suggested Improvements: ${suggestions}`;

  await createNotification({
    recipient: authorId,
    recipientRole: 'user',
    title: 'Editorial Feedback Received',
    message: msg,
    type: 'story_feedback',
    link: `/stories/${story._id}`,
    metadata: { storyId: story._id, feedback, suggestions },
    io
  });
};

/**
 * 5. Story activity: Community upvote
 */
const notifyStoryVoted = async (story, voterUser, io = null) => {
  const authorId = story.author?._id || story.author;
  const voterId = voterUser?._id || voterUser?.id;

  // Do not notify if upvoting own story
  if (authorId && voterId && authorId.toString() === voterId.toString()) return;

  await createNotification({
    recipient: authorId,
    recipientRole: 'user',
    title: 'New Story Upvote! 🌟',
    message: `${voterUser?.name || 'A community listener'} upvoted your manuscript "${story.title}". (+5 Karma awarded)`,
    type: 'story_voted',
    link: `/stories/${story._id}`,
    metadata: { storyId: story._id, voterName: voterUser?.name },
    io
  });
};

/**
 * 6. Story activity: Written review & rating
 */
const notifyStoryReviewed = async (story, reviewerUser, rating, comment = '', io = null) => {
  const authorId = story.author?._id || story.author;
  const reviewerId = reviewerUser?._id || reviewerUser?.id;

  if (authorId && reviewerId && authorId.toString() === reviewerId.toString()) return;

  await createNotification({
    recipient: authorId,
    recipientRole: 'user',
    title: `New ${rating}-Star Review on "${story.title}"`,
    message: `${reviewerUser?.name || 'A listener'} reviewed your story: "${comment ? comment.slice(0, 90) + '...' : `${rating} stars awarded`}"`,
    type: 'story_reviewed',
    link: `/stories/${story._id}`,
    metadata: { storyId: story._id, rating, reviewerName: reviewerUser?.name },
    io
  });
};

/**
 * 7. User account status: suspended or restored
 */
const notifyUserStatusChanged = async (targetUser, newStatus, reason = '', io = null) => {
  const userId = targetUser._id || targetUser.id;

  const isSuspended = newStatus === 'suspended';
  const title = isSuspended ? 'Account Notice: Suspended' : 'Account Restored';
  const message = isSuspended
    ? `Your KathaVani account has been suspended by an administrator. Reason: ${reason || 'Violation of community moderation standards'}.`
    : `Your KathaVani account has been reactivated. You have full access to browse and share cultural folklore.`;

  await createNotification({
    recipient: userId,
    recipientRole: 'user',
    title,
    message,
    type: isSuspended ? 'account_suspended' : 'account_restored',
    link: '/settings',
    metadata: { status: newStatus, reason },
    io
  });

  // Also log admin notification
  await createNotification({
    recipient: null,
    recipientRole: 'admin',
    title: `User Account ${newStatus.toUpperCase()}`,
    message: `Account for ${targetUser.name} (${targetUser.email}) was marked as ${newStatus}. Reason: ${reason || 'N/A'}.`,
    type: 'admin_moderation',
    link: `/admin/users`,
    metadata: { userId, status: newStatus, reason },
    io
  });
};

/**
 * 8. User account restrictions: submit_story, comment, etc.
 */
const notifyUserRestrictionsChanged = async (targetUser, capabilities = [], reason = '', io = null) => {
  const userId = targetUser._id || targetUser.id;

  const hasRestrictions = capabilities.length > 0;
  const title = hasRestrictions ? 'Account Permissions Restricted' : 'Account Restrictions Lifted';
  const message = hasRestrictions
    ? `Your account permissions have been restricted for: [${capabilities.join(', ')}]. Reason: ${reason || 'Administrative action'}.`
    : `All prior capability restrictions on your account have been lifted by administration.`;

  await createNotification({
    recipient: userId,
    recipientRole: 'user',
    title,
    message,
    type: 'account_restricted',
    link: '/settings',
    metadata: { capabilities, reason },
    io
  });
};

module.exports = {
  createNotification,
  notifyStorySubmitted,
  notifyStoryApproved,
  notifyStoryRejected,
  notifyStoryFeedback,
  notifyStoryVoted,
  notifyStoryReviewed,
  notifyUserStatusChanged,
  notifyUserRestrictionsChanged
};
