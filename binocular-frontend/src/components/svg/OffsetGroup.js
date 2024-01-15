'use strict';

const OffsetGroup = (props) => <g transform={`translate(${props.dims.wMargin}, ${props.dims.hMargin})`}>{props.children}</g>;

export default OffsetGroup;
