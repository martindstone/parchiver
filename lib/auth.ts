import session from 'express-session'

import OAuth2Strategy from 'passport-oauth2'

const sessionSettings = session({
  secret: 'meeps',
  resave: true,
  saveUninitialized: true,
})

const twitterOAuthStrategy = new OAuth2Strategy(
  {
    authorizationURL: 'https://twitter.com/i/oauth2/authorize',
    tokenURL: 'https://api.twitter.com/2/oauth2/token',
    clientSecret: '',
    clientID: process.env.CLIENT_ID || 'set your CLIENT_ID environment variable!!',
    callbackURL: '/auth/twitter/callback',
    
    pkce: true,
    state: true,
    proxy: true,
  },
  function (accessToken: string, refreshToken: string, profile: object, done: Function) {
    return done(null, {
      accessToken,
      refreshToken,
      profile
    });
  }
)

function loggedIn(req: any, res: any, next: any) {
  if (req.user && req.user.accessToken) {
    next()
  } else {
    res.redirect('/auth/twitter')
  }
}

const auth = {
  twitterOAuthStrategy,
  sessionSettings,
  loggedIn,
}
export default auth