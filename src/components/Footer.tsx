export function Footer() {
  return (
    <footer className="bg-green-50 py-8">
      {/* <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center space-x-8 pt-6">
          <a href="#" className="text-gray-600 hover:text-gray-800 text-sm">
            about
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-800 text-sm">
            privacy policy
          </a>
        </div>
      </div> */}

      <div className="mt-auto">
        {/* Footer content container with left and right horizontal lines */}
        <div className="w-full flex items-center justify-center bg-green-50 relative" style={{height: '80px'}}>
          {/* Left horizontal line */}
          {/* <div className="absolute left-0 top-1/2 w-16 h-px bg-black transform -translate-y-1/2"></div> */}
          {/* Right horizontal line */}
          {/* <div className="absolute right-0 top-1/2 w-16 h-px bg-black transform -translate-y-1/2"></div> */}
          {/* Footer content */}
          <div className="flex items-center justify-center space-x-12">
            <span className="text-gray-600">about</span>
            <span className="text-gray-600">privacy policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}