export default function Footer() {
  return (
    <footer className="w-full border-t py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Pro
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  News
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Apps
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Podcast
                </a>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Help
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Follow Us</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Threads
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  X
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Bluesky
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  TikTok
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Copyright Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Terms of Service
                </a>
              </li>
              <li className="text-xs text-gray-500 mt-4">
                © {new Date().getFullYear()} Your Company. All rights reserved.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
