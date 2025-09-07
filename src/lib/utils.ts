import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiStrings } from './apiStrings';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

  export const getUserUserId = async (privyId: string) => {
    const fetchUser = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/stream/${privyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": 'true'

      },
    });
    const userData = await fetchUser.json();
    return userData;
  }
