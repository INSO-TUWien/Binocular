'use strict';

const Labeled = props => (
  <div>
    {!!props.label && <label className="label">{props.label}</label>}
    {props.children}
  </div>
);

export default Labeled;
