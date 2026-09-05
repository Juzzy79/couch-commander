import { CheckIn } from '../types';

export async function shareCheckIn(checkIn: CheckIn): Promise<boolean> {
  const shareData = {
    title: `Checking in to ${checkIn.showTitle} on Couch Commander`,
    text: `📺 I just checked into ${checkIn.showTitle} (S${checkIn.seasonNumber}E${checkIn.episodeNumber} - "${checkIn.episodeTitle}") on Couch Commander! ${checkIn.comment ? `"${checkIn.comment}"` : ''}`,
    url: window.location.origin,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed', err);
      }
      return false;
    }
  } else {
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      return true;
    } catch {
      return false;
    }
  }
}
