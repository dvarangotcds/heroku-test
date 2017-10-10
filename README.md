# Shizzal's backend

## Configure

Create a `.env` file at the root level of the project with these environment variables (optional values provided):

```
NODE_ENV=development
BASE_PATH=localhost
PORT=3001
REALTIME_SERVER_PATH=/api/keywords
DB_HOST=localhost
DB_NAME=shizzal
DB_PASSWORD=shizzal
DB_PORT=5432
DB_USER=shizzal
LOG_LEVEL=info
REDIS_KEYWORDS_PORT=6379
REDIS_KEYWORDS_HOST=localhost
REDIS_KEYWORDS_PASSWORD=foo
REDIS_TOKENS_PORT=6379
REDIS_TOKENS_HOST=localhost
REDIS_TOKENS_PASSWORD=foo
TOKEN_SECRET=somesecret
TOKEN_EXPIRATION_SECONDS=3600
BCRYPT_SALTING_ROUNDS=10
IOS_P8_FILE_NAME=AuthKey_DM7CTAVGTP.p8
IOS_TEAM_ID=
IOS_KEY_ID=
IOS_BUNDLE_IDENTIFIER=
SENDGRID_API_KEY=
```

Note: `REALTIME_SERVER_PATH` **has** to  point to `api/keywords`, as that is the endpoint that the iOS app will use to
connect to the websocket server. Also, `BCRYPT_SALTING_ROUNDS` **has** to be at the very least 10, although 12 would
probably be a better value (do run benchmarks, though, as each extra round exponentially increases the hashing time)

Install PostGIS extension for PostgreSQL (see: http://postgis.net/install/)

## Install & Run

### Manually

* Install node js (>= 8.0.0) and npm (>= 5.0.0)
* Install yarn
* Globally install TypeScript (`yarn global add typescript`)
* `yarn install`
* `npm start`

## BUILD

* `npm run build`
This command will run the TS compiler and copy files to `/dist` folder,
_creating a zip file `dist/bundle.zip`_ that can be uploaded to AWS ElasticBeanstalk.

Please note that the command `tsc || true` is needed to prevent 
halting the build process if the `tsc` command returns any minor warning.
When `tsc` throws a warning the exit status is 1 which causes npm lifecycle to completely stop.

If you need to copy additional static files add them to the build command:
`"build": "tsc || true && npm run copy-assets && npm run copy-package"`
