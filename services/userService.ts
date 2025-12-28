import { UserProfile } from '../types';

const USER_STORAGE_KEY = 'userProfile';
const EVENT_NAME = 'user-profile-updated';

const DEFAULT_USER: UserProfile = {
  name: 'Nguyễn Minh Anh',
  id: 'HS-2023-889',
  class: 'Lớp 8A1',
  school: 'THCS Chu Văn An',
  gender: 'male',
  joinDate: '01/09/2023',
  dateOfBirth: '15/08/2010',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkjWqv77lVXjzPkIc194kK8lzlFgE7VRWCOfYdkw3dUFed5MNcvOq1H6NUeCuasaLA8xoJU8MOH6FwE32Tp90CnocdW5K8Io_kQLQbey_Q19RRvFMtG1y2YtljjO0mzEep1qd0WZJ5wFyJ0SjOlYMj0xJPFP5RfsD0sroQHpoac2Dsk2cOzvNpvClXl9QzGpqUnEzyaYqD-QDv0EAds1YWp1FKa3CpZcvpsuf85uKQHnxcp-fp0PILaTdPuKfY8gxNPz9sAtCrTQPr',
  settings: {
    notifications: true
  },
  stats: {
    solvedTasks: 0,
    averageScore: 0,
    streakDays: 0,
    totalXP: 0
  }
};

const MALE_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkjWqv77lVXjzPkIc194kK8lzlFgE7VRWCOfYdkw3dUFed5MNcvOq1H6NUeCuasaLA8xoJU8MOH6FwE32Tp90CnocdW5K8Io_kQLQbey_Q19RRvFMtG1y2YtljjO0mzEep1qd0WZJ5wFyJ0SjOlYMj0xJPFP5RfsD0sroQHpoac2Dsk2cOzvNpvClXl9QzGpqUnEzyaYqD-QDv0EAds1YWp1FKa3CpZcvpsuf85uKQHnxcp-fp0PILaTdPuKfY8gxNPz9sAtCrTQPr';
const FEMALE_AVATAR = 'https://cdn-icons-png.flaticon.com/512/6997/6997662.png'; // High quality female student icon

export const getUserProfile = (): UserProfile => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) {
    return DEFAULT_USER;
  }
  const parsed = JSON.parse(stored);
  // Ensure defaults for new fields if old data exists
  return { 
    ...DEFAULT_USER, 
    ...parsed,
    // Deep merge for settings object to avoid undefined errors if user exists but settings don't
    settings: { ...DEFAULT_USER.settings, ...parsed.settings }
  };
};

export const updateUserProfile = (data: Partial<UserProfile>) => {
  const current = getUserProfile();
  
  // Logic to switch avatar if gender changes
  let newAvatar = current.avatar;
  if (data.gender && data.gender !== current.gender) {
    newAvatar = data.gender === 'male' ? MALE_AVATAR : FEMALE_AVATAR;
  }

  const updated = { ...current, ...data, avatar: newAvatar };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  
  // Dispatch event for other components to update
  window.dispatchEvent(new Event(EVENT_NAME));
  
  return updated;
};

export const subscribeToUserUpdates = (callback: () => void) => {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
};