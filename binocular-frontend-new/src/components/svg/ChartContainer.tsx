'use strict';

import React from 'react';
import Measure, { BoundingRect, ContentRect } from 'react-measure';

interface ChartContainerProps {
  className?: string;
  children: React.ReactNode;
  onResize: (dimensions: BoundingRect) => void;
}

export default class ChartContainer extends React.PureComponent<ChartContainerProps> {
  constructor(props: ChartContainerProps) {
    super(props);
  }

  render(): React.ReactNode {
    return (
      <Measure bounds onResize={(contentRect: ContentRect) => this.props.onResize(contentRect.bounds!)}>
        {({ measureRef }) => (
          <div ref={measureRef} className={this.props.className}>
            {this.props.children}
          </div>
        )}
      </Measure>
    );
  }
}