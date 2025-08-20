// src/app/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 从环境变量获取密码（生产环境需配置Vercel环境变量）
    const correctPassword = process.env.NEXT_PUBLIC_ACCESS_PASSWORD || 'default-password'

    if (password === correctPassword) {
      // 验证通过，设置Cookie（有效期1天）
      document.cookie = 'site_auth=' + correctPassword + '; max-age=86400; path=/'
      router.push('/') // 跳转到首页
    } else {
      setError('密码错误，请重试')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">请输入访问密码</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          确认访问
        </button>
      </form>
    </div>
  )
}