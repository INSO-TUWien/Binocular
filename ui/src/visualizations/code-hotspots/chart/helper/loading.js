import * as d3 from 'd3';
import styles from '../../styles.scss';


export default class Loading{
  static insert(){
    d3.select("#loading").remove();
    d3.select('.loadingContainer')
      .append("div")
      .attr("id","loading")
      .html("<div class="+styles.loaderContainer+"><div class="+styles.loader+"></div></div>");
  }

  static remove(){
    d3.select("#loading").remove();
  }

  static setErrorText(text){
    d3.select("#loading").remove();
    d3.select('.loadingContainer')
      .append("div")
      .attr("id","loading")
      .html("<div class='"+styles.loaderContainer+" "+styles.error+"'><div style='font-weight: bold'>Error:</div><div>"+text+"</div></div>");
  }
}
