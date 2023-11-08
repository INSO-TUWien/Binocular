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
echo " \"arango\": { \"host\": \"arangodb\", \"port\": \"8529\", \"user\": \"root\", \"password\":\"$ARANGO_ROOT_PASSWORD\"}" >> $BINOCULARRC
#echo " \"indexers\": { \"its\": \"gitlab\", \"ci\": \"gitlab\"}" >> $BINOCULARRC
echo "}" >> $BINOCULARRC

echo
echo ".binocularrc was created as follows:"
cat $BINOCULARRC
echo

# mine repo, ITS and CI
echo
echo "Mining repository and starting front end"
echo

cd /install/Binocular
node $APP_NAME.js /target/$REPO_NAME & npm run dev-frontend


echo
echo "Finished"
echo

/usr/bin/env bash

