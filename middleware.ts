// middleware.ts（修改后）
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 从环境变量读取密码（不再硬编码）
const PROTECTED_PASSWORD = process.env.ACCESS_PASSWORD  // 这里用 process.env 读取

export function middleware(request: NextRequest) {
  // 跳过静态资源和API路由
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

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}