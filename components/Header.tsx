import { Cast, Bell, Search } from 'lucide-react';
import Link from 'next/link';

const categories = ['All', 'Podcasts', 'Music', 'Satire', 'Live', 'Gaming', 'News'];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition">
          <span className="text-2xl font-bold text-white">Fitrah</span>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <button className="text-white hover:text-gray-300 transition">
            <Cast size={24} />
          </button>
          <button className="text-white hover:text-gray-300 transition">
            <Bell size={24} />
          </button>
          <button className="text-white hover:text-gray-300 transition">
            <Search size={24} />
          </button>
        </div>
      </div>
      
      {/* Category Pills */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-3">
          {categories.map((category, index) => (
            <button
              key={category}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                index === 0
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
