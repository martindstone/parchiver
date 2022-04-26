import express, { Router } from 'express'
import passport from 'passport'

import auth from '../lib/auth'
const router = Router()

passport.use(auth.twitterOAuthStrategy)

passport.serializeUser(function (user, done) {
  console.log('serialize user user is', user)
  done(null, user)
})

passport.deserializeUser(function (req: express.Request, user: any, done: Function) {
  console.log('deserialize user user is ', user)

  done(null, user)
})

router.get(
  '/twitter',
  passport.authenticate('oauth2', {
    scope: ['tweet.read', 'tweet.write', 'users.read', 'tweet.read',
      'users.read', 'like.write', 'like.read', 'follows.read',
      'block.read',
      'list.read',
      'follows.write', 'offline.access']
  })
)

router.get(
  '/twitter/callback',
  passport.authenticate('oauth2', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
)

export default router