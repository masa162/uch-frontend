'use client'

import { useState, useEffect } from 'react'

const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD
const SESSION_STORAGE_KEY = 'site_password_verified'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // --- 変更点1：自動認証ロジック ---
  // password変数が変更されるたびに実行される
  useEffect(() => {
    // パスワードが一致したら、自動的に認証を完了させる
    if (password === SITE_PASSWORD) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
      setIsAuthenticated(true)
      setError('')
    }
  }, [password]) // passwordが変わるのを監視

  useEffect(() => {
    if (SITE_PASSWORD) {
      const isVerified = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (isVerified === 'true') {
        setIsAuthenticated(true)
      }
    } else {
      setIsAuthenticated(true)
    }
  }, [])

  // 送信ボタンやEnterキーにも対応するため、この関数は残します
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== SITE_PASSWORD) {
      setError('あいことばが違います。')
    }
  }

  if (!SITE_PASSWORD || isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 bg-base-100 flex items-center justify-center z-50">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">あいことばを入力してください 🏠</h2>
          <p>このサイトを閲覧するには「あいことば」が必要です。</p>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <input
                // --- 変更点2：入力文字を表示 ---
                type="text" // "password" から "text" に変更
                placeholder="あいことば"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus // ページを開いたらすぐ入力できるようにする
              />
            </div>
            {error && <p className="text-error text-sm mt-2">{error}</p>}
            <div className="card-actions justify-end mt-4">
              <button type="submit" className="btn btn-primary">
                入室
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}