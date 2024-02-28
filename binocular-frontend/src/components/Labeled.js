'use strict';

const Labeled = (props) => (
  <div className={props.className}>
    {!!props.label && <label className="label">{props.label}</label>}
    {props.children}
  </div>
);

export default Labeled;
