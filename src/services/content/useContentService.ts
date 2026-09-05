import { useEffect, useState } from 'react';
import { contentService } from './contentService';
import { ContentServiceStatus } from './types';

/**
 * Custom React hook for consuming ContentService state
 */
export function useContentService(): ContentServiceStatus {
  const [status, setStatus] = useState<ContentServiceStatus>(() => contentService.getStatus());

  useEffect(() => {
    const unsubscribe = contentService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  return status;
}
