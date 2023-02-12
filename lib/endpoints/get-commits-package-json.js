'use strict';

const isomorphicGit = require('isomorphic-git');
const fs = require('fs');

module.exports = async function(req, res) {
    try{
        const dependency = req.query.dep;
        const commitsPackage = await getAllCommits();
        let response = [];
        for(const commit of commitsPackage){
            let commitDetail = commitDetails(commit);
            commitDetail.dependencies = await getDependencies(commitDetail.oid);
            response.push(commitDetail);
        }
        let evolution = [];
        if(dependency){
            for(const commit of response){
                if(commit.dependencies[dependency]){
                    evolution.push({version: commit.dependencies[dependency], date: commit.date, oid: commit.oid, message: commit.message, committer: commit.committer});
                }
            }
            res.send(evolution.sort((a,b) => new Date(a.date) - new Date(b.date)));
        } else {
            res.send(response.sort((a,b) => new Date(a.date) - new Date(b.date)));
        }
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

async function getDependencies(oid){
    let { blob } =  await isomorphicGit.readBlob({
        fs,
        dir: '.',
        oid: oid,
        filepath: 'package.json'
      })
      return JSON.parse(Buffer.from(blob).toString('utf8')).dependencies;
}

async function getDevDependencies(oid){
    let { blob } =  await isomorphicGit.readBlob({
        fs,
        dir: '.',
        oid: oid,
        filepath: 'package.json'
      })
      return JSON.parse(Buffer.from(blob).toString('utf8')).devDependencies;
}

async function getAllCommits(){
  
    let commits = await isomorphicGit.log({
      fs,
      dir: '.',
      filepath: 'package.json'
    })
    return commits;
  }
