'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useAuthAction } from '@/hooks/useAuthAction'
import RealtimeSearch from '@/components/RealtimeSearch'

interface Tag {
  name: string
  count: number
}

interface Article {
  id: string
  title: string
  slug: string
  pubDate: Date
}

interface ArchiveHierarchy {
  [year: string]: {
    [month: string]: Article[]
  }
}

interface SidebarProps {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps = {}) {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user
  const { runAuthAction } = useAuthAction()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [archiveHierarchy, setArchiveHierarchy] = useState<ArchiveHierarchy>({})
  const [loadingArchive, setLoadingArchive] = useState(false)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  const handleNavigation = (path: string) => {
    router.push(path)
    onNavigate?.()
  }

  const handleSignOut = () => {
    if (confirm('ログアウトしますか？')) {
      signOut({ callbackUrl: '/' })
      setShowUserMenu(false)
      onNavigate?.()
    }
  }

  const handleTagClick = (tagName: string) => {
    router.push(`/tags/${encodeURIComponent(tagName)}`)
    onNavigate?.()
  }

  return (
    <div className="card bg-base-100 shadow-xl p-6 space-y-4">
      {/* Logo */}
      <div className="w-fit mx-auto mb-6">
        <button
          onClick={() => handleNavigation('/')}
          className="block"
          aria-label="トップページへ"
        >
          <img
            src="/images/ogp/ogp.png"
            alt="うちのきろく ロゴ画像"
            className="rounded-lg shadow hover:shadow-xl transition ease-in-out hover:scale-[102%] max-w-32 w-auto h-auto"
            width="200"
            height="200"
          />
        </button>
      </div>
      
      {/* リアルタイム検索ボックス */}
      <div>
        <RealtimeSearch 
          placeholder="記事を検索..." 
          className="form-control"
          onNavigate={onNavigate}
        />
      </div>
      
      {/* ユーザーメニュー or ログインボタン */}
      {session && user ? (
        // ログイン済み
        <div className="space-y-2">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-primary-light transition-colors"
            >
              <div className="avatar">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold flex items-center gap-2">
                  {user.name || 'ユーザー'}
                  {user.role === 'GUEST' && (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      ゲスト
                    </span>
                  )}
                </div>
                {user.username && (
                  <div className="text-xs text-base-content/70">
                    @{user.username}
                  </div>
                )}
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showUserMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10">
                {user.role !== 'GUEST' ? (
                  <>
                    <button
                      onClick={() => {
                        handleNavigation('/profile')
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 transition-colors"
                    >
                      📱 プロフィール
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        runAuthAction(() => handleNavigation('/articles/new'))
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 transition-colors"
                    >
                      ✏️ 記事を書く
                    </button>
                    <hr className="border-base-300" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 transition-colors text-error"
                    >
                      🚪 ログアウト
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => signIn('google', { callbackUrl: typeof window !== 'undefined' ? window.location.origin + '/' : '/' })}
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 transition-colors text-primary"
                    >
                      Googleでログイン/登録
                    </button>
                    <button
                      onClick={() => signIn('line', { callbackUrl: typeof window !== 'undefined' ? window.location.origin + '/' : '/' })}
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 transition-colors text-primary"
                    >
                      LINEでログイン/登録
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        // 未ログイン
        <div className="space-y-2">
          <button
            onClick={() => signIn('google', { callbackUrl: typeof window !== 'undefined' ? window.location.origin + '/' : '/' })}
            className="btn btn-primary w-full"
          >
            Googleでログイン
          </button>
          <button
            onClick={() => signIn('line', { callbackUrl: typeof window !== 'undefined' ? window.location.origin + '/' : '/' })}
            className="btn btn-secondary w-full mt-2"
          >
            LINEでログイン
          </button>
        </div>
      )}
      
      {/* 発見とメモ */}
      <div className="space-y-2">
        <h3 className="font-bold text-primary-dark">🔍 発見とメモ</h3>
        <ul className="menu">
          <li>
            <button
              onClick={() => handleNavigation('/articles')}
              className="w-full flex items-center text-left hover:bg-primary-light hover:text-primary-dark transition-colors"
            >
              📚 記事一覧
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation('/search')}
              className="w-full flex items-center text-left hover:bg-primary-light hover:text-primary-dark transition-colors"
            >
              🔍 検索
            </button>
          </li>
          <li>
            <button
              onClick={() => handleNavigation('/gallery')}
              className="w-full flex items-center text-left hover:bg-primary-light hover:text-primary-dark transition-colors"
            >
              📷 メディアギャラリー
            </button>
          </li>
        </ul>
      </div>
      
      {/* 人気のタグ */}
      <div className="space-y-2">
        <h3 className="font-bold text-primary-dark">🏷️ 人気のタグ</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleTagClick('家族')}
            className="badge badge-primary badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            家族
          </button>
          <button 
            onClick={() => handleTagClick('思い出')}
            className="badge badge-primary badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            思い出
          </button>
          <button 
            onClick={() => handleTagClick('旅行')}
            className="badge badge-primary badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            旅行
          </button>
          <button 
            onClick={() => handleTagClick('料理')}
            className="badge badge-primary badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            料理
          </button>
        </div>
      </div>
    </div>
  );
}
