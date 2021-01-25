'use strict';

export default class ListGeneration {
  static generateDeveloperList (developerData) {
    let developerListHTML="<div><ul>"

    for (let i in developerData){
      let developer = developerData[i];
      let color = i%2===0?"#eeeeee":"#dddddd"
      developerListHTML += "<li style='background-color: "+color+"'>" +
        "<span style='float: left;margin-left: 5px;'>" +
        "<b>"+developer.dev+"</b>" +
        "</span>" +
        ": " +
        "<span style='float: right;margin-right: 5px;'>"+
        developer.value+
        "</span>" +
        "</li>";
    }

    developerListHTML += "</ul></div>";
    return developerListHTML;
  }

  static generateIssueList (issueData) {
    let issueListHTML="<div><ul>"

    for (let i in issueData){
      let issue = issueData[i];
      let color = i%2===0?"#eeeeee":"#dddddd"
      issueListHTML += "<li style='background-color: "+color+"'>" +
        "<span style='float: left;margin-left: 5px;'>" +
        "<b>"+issue.title+"</b>" +
        "</span>" +
        ": " +
        "<span style='float: right;margin-right: 5px;'>"+
        issue.value+
        "</span>" +
        "</li>";
    }

    issueListHTML += "</ul></div>";
    return issueListHTML;
  }
}
