'use strict';

import { connect } from 'react-redux';
import Chart from './chart.tsx';
import { GlobalState } from '../../../../types/globalTypes.ts';

interface Props {} //TODO: replace empty interface
const mapStateToProps = (state: GlobalState): Props => {
  return {}; //TODO: replace function with actual mapping
};

const mapDispatchToProps = () => {
  return {}; //TODO: replace function with actual mapping
};

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(Chart);
