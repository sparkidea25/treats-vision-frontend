import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiStrings } from './apiStrings';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

  export const getUserUserId = async (privyId: string) => {
    const fetchUser = await fetch(`${ApiStrings.API_BASE_URL}/auth/${privyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": 'true',
        "Access-Control-Allow-Origin": "*",
      },
    });
    const userData = await fetchUser.json();
    return userData;
  }

    export const fetchUsername = async (privyId: any) => {
      try {
        console.log("Fetching username for:", privyId);
        const res = await fetch(`${ApiStrings.API_BASE_URL}/auth/${privyId}`, {
          method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      "ngrok-skip-browser-warning": 'true',
                      "Access-Control-Allow-Origin": "*",
                  }
        });
        const data = await res.json();
        console.log("Username fetched:", data.name);
        return data.name;
      } catch (e) {
        console.error("Error fetching username:", e);
        return "";
      }
    };
