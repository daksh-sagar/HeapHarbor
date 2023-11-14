import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  debug: true,
  publicRoutes: ['/', '/api/webhook'],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
