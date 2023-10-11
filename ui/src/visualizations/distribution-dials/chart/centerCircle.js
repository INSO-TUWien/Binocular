import { useState, useEffect } from 'react';
import chroma from 'chroma-js';
import { useSelector } from 'react-redux';

function CenterCircle({ radius, label, data, isDataVisible }) {
  //global state
  const universalSettings = useSelector((state) => state.universalSettings);
  const authorColors = universalSettings.universalSettingsData.data.palette;

  //local state
  const [devLines, setDevLines] = useState([]);

  const sortedData = data.sort((a, b) => b.data - a.data);
  const total = data.reduce((prev, curr) => prev + curr.data, 0);
  const max = data.reduce((prev, curr) => Math.max(prev, curr.data), 0);

  //corners of the square that is used for text
  const upperLeftCorner = {
    x: -(radius * 0.7),
    y: -(radius * 0.6),
  };

  const upperRightCorner = {
    x: radius * 0.7,
    y: -(radius * 0.6),
  };

  //update components for every dev when data changes
  useEffect(() => {
    //here we compute the components that indicate the distribution of the data among the devs
    let result = [];

    const linespacing = 23;
    const maxLines = 6;
    //decide at which y to start so it is always centered
    const startY = (Math.min(sortedData.length + 1, maxLines + 1) / 2) * linespacing * -1;

    result.push(
      <CenteredText
        text={`${label.toUpperCase()}: ${total.toLocaleString()}`}
        x={upperLeftCorner.x + (upperRightCorner.x - upperLeftCorner.x) / 2}
        y={upperLeftCorner.y}
      />
    );
    result = result.concat(
      sortedData.map((d, i) => {
        return (
          <DevLine
            devName={d.name}
            data={d.data}
            maxData={max}
            x={upperLeftCorner.x}
            y={startY + (i + 1.5) * linespacing}
            maxLength={upperRightCorner.x - upperLeftCorner.x}
            color={authorColors[d.name]}
          />
        );
      })
    );

    //if there are too many lines, trim the array and display '...' in the visualization
    if (result.length > maxLines) {
      result = result.slice(0, maxLines);
      result.push(
        <CenteredText
          text="..."
          x={upperLeftCorner.x + (upperRightCorner.x - upperLeftCorner.x) / 2}
          y={upperLeftCorner.y + maxLines * linespacing}
        />
      );
    }

    setDevLines(result);
  }, [sortedData]);

  return (
    <>
      <circle cx="0" cy="0" r={radius} stroke="DarkGray" fill="white" />
      {isDataVisible && devLines}
    </>
  );
}

function DevLine({ devName, data, maxData, x, y, maxLength, color }) {
  const barLength = maxLength * (data / maxData);
  const barHeight = 20;
  const devColor = color ? chroma(color).hex() : 'DarkGray';
  const devColorDark = chroma(devColor).darken().hex();

  return (
    <>
      <rect
        x={x}
        y={y - (barHeight - 5)}
        width={barLength}
        height={barHeight}
        style={{ fill: devColorDark }}
        rx={2}
        ry={2}
        id={`${devName}_rect`}
      />

      <text>
        <tspan x={x + 8} y={y} stroke={'white'} fill={'black'} strokeWidth={1.5} paintOrder="stroke" id={`${devName}_text`}>
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
