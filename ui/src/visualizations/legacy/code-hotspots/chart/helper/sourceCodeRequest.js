'use strict';

import Loading from './loading';

export default class SourceCodeRequest {
  static getSourceCode(fileUrl, path, checkedOutBranch, branch, sha, gitlabProjectID, apiKey, gitlabServer) {
    if (this.checkIfServerIsGitlab(fileUrl)) {
      return new Promise((resolve, reject) => {
        const sourceCodeRequest = new XMLHttpRequest();

        sourceCodeRequest.open(
          'GET',
          gitlabServer +
            'api/v4/projects/' +
            gitlabProjectID +
            '/repository/files/' +
            path.replaceAll('/', '%2F') +
            '/raw?ref=' +
            (sha === '' ? branch : sha),
        );
        sourceCodeRequest.setRequestHeader('PRIVATE-TOKEN', apiKey);
        sourceCodeRequest.onload = function () {
          if (sourceCodeRequest.readyState === 4) {
            if (sourceCodeRequest.status === 200) {
              resolve(sourceCodeRequest.responseText);
            } else if (sourceCodeRequest.status === 401) {
              resolve('Authentication Error. API Key missing or entered wrong!');
            } else {
              resolve('No commit code in current selected Branch!');
            }
          }
        }.bind(this);
        sourceCodeRequest.onerror = function () {
          Loading.setErrorText(sourceCodeRequest.statusText);
          console.error(sourceCodeRequest.statusText);
          resolve('Not possible to request sourcecode. Please enter the correct Gitlab Server, project ID and API Key in the settings');
        };
        sourceCodeRequest.send(null);
      });
    } else {
      return new Promise((resolve, reject) => {
        const sourceCodeRequest = new XMLHttpRequest();
        sourceCodeRequest.open(
          'GET',
          fileUrl
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob', '')
            .replace(checkedOutBranch, sha === '' ? branch : sha),
          true,
        );
        sourceCodeRequest.onload = function () {
          if (sourceCodeRequest.readyState === 4) {
            if (sourceCodeRequest.status === 200) {
              resolve(sourceCodeRequest.responseText);
            } else {
              resolve('No commit code in current selected Branch!');
            }
          }
        }.bind(this);
        sourceCodeRequest.onerror = function () {
          Loading.setErrorText(sourceCodeRequest.statusText);
          console.error(sourceCodeRequest.statusText);
          resolve('Not possible to request sourcecode.');
        };
        sourceCodeRequest.send(null);
      });
    }
  }

  static checkIfServerIsGitlab(fileUrl) {
    return !fileUrl.includes('github');
  }
}
