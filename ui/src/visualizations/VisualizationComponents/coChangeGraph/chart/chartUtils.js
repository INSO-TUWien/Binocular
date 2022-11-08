import * as d3 from 'd3';

export function highlightNodeAndLinks(d, fixedHighlighting, _nodes, _links, _text, _dataset) {   
    if(fixedHighlighting) return;
      
    // Highlight the connections
    _links.style('stroke-width', function (link_d) {return link_d.source.id === d.id || link_d.target.id === d.id ? 5 : 0.1;})
    const filteredLinks = _links.filter(_ => _.source.id === d.id || _.target.id === d.id);
    filteredLinks.raise();

    let targetNodes = new Set();
    filteredLinks.each(_ => {targetNodes.add(_.target.id); targetNodes.add(_.source.id)});

    let targetModuls = new Set();
    _dataset.fileToModuleLinks.forEach(element => {
      if (targetNodes.has(element.source.id)) {
        targetModuls.add(element.target.id)
      }
    });
    
    _text.style("fill", function (link_d) {
      return targetNodes.has(link_d.id) || targetModuls.has(link_d.id) ? 'black' : 'transparent'
    })
    _nodes.style('stroke-width', function (node_d) {return targetNodes.has(node_d.id) ? 1 : 0.1})
    _nodes.style('fill', function (node_d) {
      return targetNodes.has(node_d.id) ? "orange" : targetModuls.has(node_d.id) ? "yellow" : "transparent"
    })

    d3.select(this).style('fill', 'red');
  }