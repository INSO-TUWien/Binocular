#!/bin/bash
REPO=$1

# extract repo name with string magic
REPO_NAME_GIT="${REPO##*/}"
REPO_NAME="${REPO_NAME_GIT%.*}"

echo
echo "Got repo $REPO_NAME"
echo


# name of main javascript file and executable (and prefix for databases)
APP_NAME="binocular"
BINOCULARRC=".binocularrc"

# Clone target repository
echo
echo "Cloning target repository $REPO_NAME"
echo
mkdir target
cd target
git clone $REPO

echo
echo "Creating .binocularrc"
echo


cd $REPO_NAME

echo "{" >> $BINOCULARRC
#echo " \"gitlab\": { \"url\": \"$REPO_PROTOCOL://$REPO_HOST/repo\", \"project\": \"$REPO_USER/$REPO_NAME\", \"token\": \"$GITLAB_TOKEN\"}," >> $BINOCULARRC
echo " \"github\": { \"auth\": { \"token\": \"$GITHUB_TOKEN\"}}," >> $BINOCULARRC
echo " \"arango\": { \"host\": \"0.0.0.0\", \"port\": \"8530\", \"user\": \"root\", \"password\":\"$ARANGO_ROOT_PASSWORD\"}" >> $BINOCULARRC
#echo " \"indexers\": { \"its\": \"gitlab\", \"ci\": \"gitlab\"}" >> $BINOCULARRC
echo "}" >> $BINOCULARRC

echo
echo ".binocularrc was created as follows:"
cat $BINOCULARRC
echo

echo
echo "Starting arangodb service"
echo

../../arangodb3-linux-3.11.1_x86_64/bin/arangod --server.endpoint tcp://0.0.0.0:8530 --database.directory standalone &

bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:8530/_api/version)" != "401" ]]; do sleep 5; done'

# mine repo, ITS and CI
echo
echo "Mining repository and starting front end"
echo

cd /install/Binocular
node $APP_NAME.js /target/$REPO_NAME & npm run dev-frontend

echo
echo "Creating offline artifact from ArangoDB exports"
echo

npm run build

cp -r dist /output/

echo
echo "Copied dist to host"
echo

echo
echo "Finished"
echo

/usr/bin/env bash

