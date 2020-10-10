import React from 'react';
import styles from "../css/fileBrowser.scss"
import * as ReactDOM from 'react-dom';

export default class FileBrowser extends React.PureComponent{

  convertData(data){
    let convertedData = {};
    for (let file of data) {
      let pathParts = file.key.split("/");
      this.genPathObjectString(convertedData,pathParts,file.webUrl,file.key);
    }

    return convertedData;
  }

  genPathObjectString(path,pathParts,Url,Path){
    let currElm = pathParts.shift()

    if(pathParts.length==0){
      if(path[currElm]==undefined){
        path[currElm] = {obj: {},type:"",name:""};
      }
      path[currElm].obj.url=  Url;
      path[currElm].obj.path=Path;
      path[currElm].obj.type="file";
      path[currElm].type="file";
    }else {
      if(path[currElm]==undefined){
        path[currElm] = {type:"",name:""};
      }
      this.genPathObjectString(path[currElm],pathParts,Url,Path);
      path[currElm].type ="folder";
    }
    path[currElm].name=currElm;
    return path;
  }


  render() {
    //this.props.props.onSetFile("https://github.com/INSO-TUWien/Binocular/blob/master/pupil.js");
    //this.props.props.onSetPath("pupil.js");
    let convertedData = this.convertData(this.props.files)

    return <div>
      <h1>Files:</h1>
      <FileStruct
        data={convertedData}
        props={this.props.props}
      />
    </div>;
  }

}

class FileStruct extends React.PureComponent {

  render() {
    return (
      <div>
        {Object.keys(this.props.data).map((data,i)=> {
          let currData= this.props.data[data];
            if (currData.type === "file") {
              return <div className={styles.button+" "+(i%2===0?styles.BCEven:styles.BCOdd)} key={currData.name} onClick={()=>{
                this.props.props.onSetFile(currData.obj.url);
                this.props.props.onSetPath(currData.obj.path);

              }}>
                {currData.name}
              </div>;
            }else if(currData.type==="folder"){
              return <div  key={currData.name}>
                <button className={styles.button+" "+(i%2===0?styles.ACEven:styles.ACOdd)} onClick={(e)=>{
                  let panel = e.currentTarget.nextSibling;
                  if (panel.style.display === "block") {
                    panel.style.display = "none";
                  } else {
                    panel.style.display = "block";
                  }
                }}>{currData.name}</button>
                <div id={""+i+"panel"+currData.name} className={styles.panel}>
                  <FileStruct
                    data={currData}
                    props={this.props.props}
                  />
                </div>
              </div>;
            }
          })
        }
      </div>
    );
  }


  clickFile(Url,Path){
    console.log(Url);
    console.log(Path);
  }
}
