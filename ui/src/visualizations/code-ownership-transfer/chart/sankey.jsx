var React = require('react');
var Sankey = require('paths-js/sankey');
var data = require('../data/sankey.json');

var palette = ['#707b82', '#7881c2', '#3e90f0'];

function opacity(i, j) {
  if (j == null) return 0.7;
  if (j == i) return 1;
  return 0.3;
}
function opacityRect(item, start, end) {
  if (start == null) return 0.7;
  if ((item.id == start) || (item.id == end)) return 1;
  return 0.3;
}

module.exports = React.createClass({
  getInitialState: function() {
    return {
      index: null,
      start: null,
      end: null
    };
  },
  enter: function(r) {
    this.setState({
      index: r.index,
      start: r.item.start,
      end: r.item.end
    });
  },
  exit: function() {
    this.setState({
      index: null,
      start: null,
      end: null
    });
  },
  render: function() {
    var sankey = Sankey({
      data: data[0],
      width: 500,
      height: 400,
      gutter: 15,
      rectWidth: 10,
      nodeaccessor: function(x) { return x.id; }
    });
    var self = this;
    var curvedRectangles = sankey.curvedRectangles.map(function(r, i) {
      return <g>
        <path d={ r.curve.path.print() } fill="#acd1e9" style={{ opacity: opacity(i, self.state.index) }}
              onMouseEnter={ self.enter.bind(self, r) } onMouseLeave={ self.exit } />
      </g>;
    });
    var rectangles = sankey.rectangles.map(function(r) {
      var text;
      var op = opacityRect(r.item, self.state.start, self.state.end);
      var x = r.curve.centroid[0];
      var y = r.curve.centroid[1];
      if (r.group < data[0].nodes.length / 2) {
        var transform = "translate(" + (x + 7) + "," + y + ")";
        text = <text transform={ transform } style={{ opacity: op }} textAnchor="start">{ r.item.id }</text>;
      } else {
        var transform = "translate(" + (x - 7) + "," + y + ")";
        text = <text transform={ transform } style={{ opacity: op }} textAnchor="end">{ r.item.id }</text>;
      }
      return <g>
        <path d={ r.curve.path.print() } fill={ palette[r.group] } />
        { text }
      </g>;
    });
    return (
      <div>
        <svg width={ 500 } height={ 400 }>
          { curvedRectangles }
          { rectangles }
        </svg>
      </div>
    );
  }
});
