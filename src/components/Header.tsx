import { Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-green-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
            <img
              src="/assets/logo.png"
              alt="Livestream Logo"
              className="h-6 w-auto"
            />
          </div>
          </div>
        </div>
        
        <nav className="flex items-center space-x-6">
          <Button 
            variant="ghost" 
            className="text-gray-700 hover:bg-gray-100 text-sm font-normal"
          >
            <img 
            src="/assets/live.png"
            alt="Featured livestream"
            className="w-full h-full"
          />
            go live
          </Button>
          <Button 
            variant="ghost" 
            className="text-gray-700 hover:bg-gray-100 text-sm font-normal flex items-center"
          >
             <img 
            src="/assets/rewards.png"
            alt="Featured livestream"
            className="w-full h-full"
          />
            rewards
          </Button>
          <Button 
            variant="ghost" 
            className="text-gray-700 hover:bg-gray-100 text-sm font-normal flex items-center"
          >
             <img 
            src="/assets/account.png"
            alt="Featured livestream"
            className="w-full h-full"
          />
            {/* <User className="w-4 h-4 mr-1" /> */}
            account
          </Button>
        </nav>
      </div>
    </header>
  );
}