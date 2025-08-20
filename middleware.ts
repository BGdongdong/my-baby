// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 定义密码（建议从环境变量读取，避免硬编码）
const PROTECTED_PASSWORD = process.env.ACCESS_PASSWORD || 'your-default-password'

export function middleware(request: NextRequest) {
  // 跳过静态资源和API路由（可选）
  if (request.nextUrl.pathname.startsWith('/_next/') || request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 检查cookie中是否已验证
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true'

  // 如果未验证且不在登录页，重定向到登录页
  if (!isAuthenticated && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// 配置需要保护的路径（这里保护所有路径）
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}