// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 密码可以从环境变量读取（推荐），避免硬编码
const PROTECTED_PASSWORD = process.env.ACCESS_PASSWORD || 'default-password'

export function middleware(request: NextRequest) {
  // 跳过静态资源和API路由（避免影响功能）
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // 检查是否已通过验证（通过Cookie判断）
  const isAuthenticated = request.cookies.get('site_auth')?.value === PROTECTED_PASSWORD

  // 未验证且不在登录页 → 重定向到登录页
  if (!isAuthenticated && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// 配置需要保护的路径（所有路径）
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}