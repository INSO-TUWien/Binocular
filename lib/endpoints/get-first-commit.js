'use strict';

const isomorphicGit = require('isomorphic-git');
const fs = require('fs');

module.exports = async function(req, res) {
    try{
        const commits = await getAllCommits();
        const commit = commitDetails(commits.pop());
        res.send(commit);
      } catch (error) {
        res.status(500).send({error: error.message});
      }
};

function commitDetails(commit){
    return {
        oid: commit.oid,
        message: commit.commit.message,
        committer: commit.commit.committer.name,
        date: new Date(commit.commit.committer.timestamp * 1000)
    }
}

async function getAllCommits(){
  
    let commits = await isomorphicGit.log({
      fs,
      dir: '.'
    })
    return commits;
  }
