#!/bin/bash
set -ev
docker build -t one-app:at-test .
if [[ "${TRAVIS_BRANCH}" = "prepare-release" ]] ||
[[ "${TRAVIS_BRANCH}" = "master"  && "${TRAVIS_PULL_REQUEST}" = "false" ]]; then
  npm run build:sample-modules -- --archive-built-artifacts --bundle-statics-origin=https://one-app-statics.surge.sh
  echo 'https://one-app-sample.herokuapp.com' >> sample-module-bundles/CORS && \
  npx surge teardown one-app-statics.surge.sh && \
  npx surge sample-module-bundles one-app-statics.surge.sh && \
  docker login -u="$HEROKU_DOCKER_USERNAME" -p="$HEROKU_API_KEY" registry.heroku.com && \
  docker tag one-app:at-test registry.heroku.com/$HEROKU_APP_ID/web && \
  docker push registry.heroku.com/$HEROKU_APP_ID/web && \
  npx heroku container:release web -a $HEROKU_APP_ID && \
  ONE_DANGEROUSLY_SKIP_ONE_APP_IMAGE_BUILD=true npm run test:integration -- --remote-one-app-environment=$HEROKU_APP_URL
else
  ONE_DANGEROUSLY_SKIP_ONE_APP_IMAGE_BUILD=true npm run test:integration
fi
