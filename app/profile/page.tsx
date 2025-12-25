import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/lib/firebase/auth';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    redirect('/login');
  }

  let userEmail = '';
  let userId = '';

  try {
    const decodedToken = await adminAuth.verifySessionCookie(session.value, true);
    userId = decodedToken.uid;
    userEmail = decodedToken.email || '';
  } catch (error) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-[120px] pb-24 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-[#272727] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {userEmail.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h1 className="text-white text-2xl font-bold mb-2">Profile</h1>
            <p className="text-gray-400 text-sm break-all">{userEmail}</p>
          </div>

          <div className="border-t border-gray-600 pt-4 mt-4">
            <div className="text-gray-400 text-xs mb-1">User ID</div>
            <div className="text-white text-sm font-mono break-all">{userId}</div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 bg-white text-black text-center font-medium rounded-lg hover:bg-gray-200 transition"
          >
            Back to Home
          </Link>
          
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
