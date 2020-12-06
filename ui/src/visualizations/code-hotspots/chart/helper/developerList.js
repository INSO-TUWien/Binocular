'use strict';

export default class DeveloperList {
  static generate (developerData) {
    let developerListHTML="<div><ul>"

    for (let i in developerData){
      let developer = developerData[i];
      let color = i%2===0?"#eeeeee":"#dddddd"
      developerListHTML += "<li style='background-color: "+color+"'>" +
        "<span style='float: left;margin-left: 5px;'>" +
        "<b>"+developer.signature+"</b>" +
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
}
