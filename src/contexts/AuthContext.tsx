'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  username?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isPasswordValidated: boolean
  setPasswordValidated: (validated: boolean) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isPasswordValidated, setIsPasswordValidated] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true)
    const isValidated = localStorage.getItem('uchi_password_validated')
    setIsPasswordValidated(isValidated === 'true')
  }, [])

  // 開発環境では認証スキップ時にダミーユーザーを設定
  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true'
  const user = skipAuth ? {
    id: 'dev-user',
    email: 'dev@example.com',
    name: '開発ユーザー',
    image: null,
    username: 'devuser',
    role: 'USER'
  } : null

  // 開発環境で認証スキップの場合は loading を false にする
  const loading = false

  const setPasswordValidated = (validated: boolean) => {
    setIsPasswordValidated(validated)
    if (typeof window !== 'undefined') {
      if (validated) {
        localStorage.setItem('uchi_password_validated', 'true')
      } else {
        localStorage.removeItem('uchi_password_validated')
      }
    }
  }

  const signOut = () => {
    // パスワード認証状態もリセット
    if (typeof window !== 'undefined') {
      localStorage.removeItem('uchi_password_validated')
    }
    setIsPasswordValidated(false)
    // 開発環境では何もしない
    console.log('サインアウト')
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isPasswordValidated,
      setPasswordValidated,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}