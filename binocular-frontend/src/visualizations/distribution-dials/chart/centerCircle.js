import { useState, useEffect } from 'react';
import chroma from 'chroma-js';
import { useSelector } from 'react-redux';
import _ from 'lodash';

function CenterCircle({ radius, label, data, colors, isDataVisible }) {
  //global state
  const universalSettings = useSelector((state) => state.universalSettings);
  const authorColors = universalSettings.universalSettingsData.data.palette;

  //local state
  const [devLines, setDevLines] = useState([]);
  const [heading, setHeading] = useState(null);

  //update components for every dev when data changes
  useEffect(() => {
    //corners of the square that is used for text
    const upperLeftCorner = {
      x: -(radius * 0.7),
      y: -(radius * 0.6),
    };

    const upperRightCorner = {
      x: radius * 0.7,
      y: -(radius * 0.6),
    };

    if (!data || data.length === 0) {
      setDevLines([]);
      if (label) {
        setHeading(
          <CenteredText
            text={`${label.toUpperCase()}: 0`}
            x={upperLeftCorner.x + (upperRightCorner.x - upperLeftCorner.x) / 2}
            y={upperLeftCorner.y}
          />,
        );
      }
      return;
    }

    //The `data` attribute of each author can be an array or a single value.
    //map single values to arra of length 1 so further processing is easier
    let dataPerAuthor = data;
    if (data[0].data.length === undefined) {
      dataPerAuthor = data.map((author) => {
        const newA = author;
        newA.data = [author.data];
        return newA;
      });
    }

    const sortedData = dataPerAuthor.sort((a, b) => _.sum(b.data) - _.sum(a.data));
    const total = dataPerAuthor.reduce((prev, curr) => prev + _.sum(curr.data), 0);
    const max = dataPerAuthor.reduce((prev, curr) => Math.max(prev, _.sum(curr.data)), 0);

    //here we compute the components that indicate the distribution of the data among the devs
    let result = [];

    const linespacing = 23;
    const maxLines = 6;
    //decide at which y to start so it is always centered
    const startY = (Math.min(sortedData.length + 1, maxLines + 1) / 2) * linespacing * -1;

    setHeading(
      <CenteredText
        text={`${label.toUpperCase()}: ${total.toLocaleString()}`}
        x={upperLeftCorner.x + (upperRightCorner.x - upperLeftCorner.x) / 2}
        y={upperLeftCorner.y}
      />,
    );
    result = result.concat(
      sortedData.map((d, i) => {
        return (
          <DevLine
            key={'devLine' + i}
            devName={d.name}
            data={d.data}
            maxData={max}
            x={upperLeftCorner.x}
            y={startY + (i + 1.5) * linespacing}
            maxLength={upperRightCorner.x - upperLeftCorner.x}
            authorColor={authorColors[d.name]}
            categoryColors={colors}
          />
        );
      }),
    );

    //if there are too many lines, trim the array and display '...' in the visualization
    if (result.length > maxLines) {
      result = result.slice(0, maxLines);
      result.push(
        <CenteredText
          key={'centeredText'}
          text="..."
          x={upperLeftCorner.x + (upperRightCorner.x - upperLeftCorner.x) / 2}
          y={upperLeftCorner.y + (maxLines + 1.5) * linespacing}
        />,
      );
    }

    setDevLines(result);
  }, [data]);

  return (
    <>
      <circle cx="0" cy="0" r={radius} stroke="DarkGray" fill="white" />
      {isDataVisible && heading}
      {isDataVisible && devLines}
    </>
  );
}

function DevLine({ devName, data, maxData, x, y, maxLength, authorColor, categoryColors }) {
  const barLength = maxLength * (_.sum(data) / maxData);
  const barHeight = 20;
  const devColor = authorColor ? chroma(authorColor).hex() : 'DarkGray';
  const devColorDark = chroma(devColor).darken().hex();

  let currentX = x;
  const rects = [];

  if (data.length === 1) {
    rects.push(
      <rect
        x={currentX}
        y={y - (barHeight - 5)}
        width={barLength}
        height={barHeight}
        style={{ fill: devColorDark }}
        rx={2}
        ry={2}
        id={`${devName}_rect`}
        key={`${devName}_rect`}
      />,
    );
  } else {
    const aggregatedData = _.sum(data);
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const subBarLength = barLength * (d / aggregatedData);
      rects.push(
        <rect
          x={currentX}
          y={y - (barHeight - 5)}
          width={subBarLength}
          height={barHeight}
          style={{ fill: categoryColors[i] }}
          rx={2}
          ry={2}
          id={`${devName}_rect_${i}`}
          key={`${devName}_rect_${i}`}
        />,
      );

      currentX = currentX + subBarLength;
    }
  }

  return (
    <>
      {rects}
      <text>
        <tspan
          x={x + 8}
          y={y}
          stroke={'white'}
          fill={'black'}
          strokeWidth={3}
          paintOrder="stroke"
          id={`${devName}_text`}
          key={`${devName}_text`}>
          {`${devName.split('<')[0].trim()}`}
        </tspan>
      </text>
    </>
  );
}

function CenteredText({ text, x, y }) {
  return (
    <text textAnchor="middle">
      <tspan x={x} y={y}>
        {text}
      </tspan>
    </text>
  );
}

export default CenterCircle;
