import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  debug: true,
  publicRoutes: ['/', '/api/webhooks(.*)'],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
