import localforage from 'localforage';

const offlineStore = localforage.createInstance({ name: 'KathaVani', storeName: 'offline_stories' });
const pendingStore = localforage.createInstance({ name: 'KathaVani', storeName: 'pending_sync' });

export const savePackOffline = async (pack) => {
  await offlineStore.setItem(`pack_${pack.id}`, { ...pack, downloadedAt: new Date().toISOString() });
  return true;
};

export const getOfflinePacks = async () => {
  const keys = await offlineStore.keys();
  const packs = await Promise.all(keys.map(k => offlineStore.getItem(k)));
  return packs.filter(Boolean);
};

export const removeOfflinePack = async (packId) => {
  await offlineStore.removeItem(`pack_${packId}`);
};

export const isPackDownloaded = async (packId) => {
  const item = await offlineStore.getItem(`pack_${packId}`);
  return !!item;
};

export const saveStoryForSync = async (story) => {
  const pending = (await pendingStore.getItem('pending')) || [];
  pending.push({ ...story, savedAt: new Date().toISOString() });
  await pendingStore.setItem('pending', pending);
};

export const getPendingStories = async () => {
  return (await pendingStore.getItem('pending')) || [];
};

export const clearPendingStories = async () => {
  await pendingStore.setItem('pending', []);
};
