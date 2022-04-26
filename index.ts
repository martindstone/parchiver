import express, { Express, Request, Response } from 'express'
import passport from 'passport'
import { TwitterApi, ApiResponseError } from 'twitter-api-v2'

import auth from './lib/auth'
import * as routes from './routes'

const app: Express = express()
const port = process.env.PORT || 3000

app.enable('trust proxy')
app.use(auth.sessionSettings)
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', routes.default.auth)

app.get('/', auth.loggedIn, async (req: Request, res: Response) => {
  const user = req.user as any
  const accessToken = user.accessToken
  console.log('get / user is', req.user)
  const client = new TwitterApi(accessToken)

  const currentUser = await client.currentUserV2()

  try {
    const following = await client.v2.following(currentUser.data.id, {
      asPaginator: true
    })
    while (!following.done) {
      await following.fetchNext()
    }
    const followingStr = following.users.map(x => `@${x.username} (${x.name})`).join('\n')
    res.send(`<pre>\nYou (@${currentUser.data.username}) are following ${following.users.length} users:\n\n${followingStr}\n</pre>\n`)
  } catch (error) {
    if (error instanceof ApiResponseError && error.rateLimitError && error.rateLimit) {
      res.send(`<pre>\nYou just hit the rate limit! Limit for this endpoint is ${error.rateLimit.limit} requests!\n` +
        `Request counter will reset at timestamp ${error.rateLimit.reset}.\n</pre>`);
    }
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at port ${port}`);
});
