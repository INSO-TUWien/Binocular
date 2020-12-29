import styles from './data-river-chart.component.scss';
import { RiverData } from './RiverData';

const RiverTooltip = props => {
  return !props || props.hide || !props.data || !(props.data instanceof RiverData)
    ? null
    : <div className={styles.tooltip} style={Object.assign({ top: props.tooltipTop || 0, left: props.tooltipLeft || 0 }, props.style)}>
        <h1>
          {props.data.name}
        </h1>
        <hr />
        <ul>
          <li>
            <i>sha</i>
            <span>
              {props.data.sha}
            </span>
          </li>
          <li>
            <i>date</i>
            <span>
              {props.data.date.toLocaleString()}
            </span>
          </li>
          <li>
            <i>
              {props.attribute}
            </i>
            <span>
              {props.data.attribute}
            </span>
          </li>
          <li>
            <i>additions</i>
            <span>
              {props.data.additions}
            </span>
          </li>
          <li>
            <i>deletions</i>
            <span>
              {props.data.deletions}
            </span>
          </li>
        </ul>
      </div>;
};

export default RiverTooltip;
