
"use client";

import { useEffect } from 'react';

interface RecordViewHistoryProps {
  mangaId: string;
}

const MAX_RECENTLY_READ = 12;
const LOCAL_STORAGE_KEY = 'recentlyReadManga';

export function RecordViewHistory({ mangaId }: RecordViewHistoryProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !mangaId) return;

    try {
      const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
      let recentlyRead: string[] = storedItems ? JSON.parse(storedItems) : [];

      // Remove the id if it already exists to move it to the front
      recentlyRead = recentlyRead.filter(id => id !== mangaId);

      // Add the new id to the beginning
      recentlyRead.unshift(mangaId);

      // Trim the list to the maximum size
      if (recentlyRead.length > MAX_RECENTLY_READ) {
        recentlyRead = recentlyRead.slice(0, MAX_RECENTLY_READ);
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recentlyRead));
    } catch (error) {
      console.error("Error updating recently read manga in localStorage:", error);
      // Optionally, handle storage full or other errors
    }
  }, [mangaId]);

  return null; // This component does not render anything
}
