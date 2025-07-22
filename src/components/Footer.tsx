export function Footer() {
  return (
    <footer className="bg-lime-50 py-8">
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
        <div className="w-full flex items-center justify-center bg-lime-50 relative" style={{height: '80px'}}>
          <div className="flex items-center justify-center space-x-12">
  <a href="http://treats.vision" className="text-gray-600 cursor-pointer" target="_blank" rel="noopener noreferrer">
    about
  </a>
  <a href="http://treats.vision" className="text-gray-600 cursor-pointer" target="_blank" rel="noopener noreferrer">
    privacy policy
  </a>
</div>

        </div>
      </div>
    </footer>
  );
}