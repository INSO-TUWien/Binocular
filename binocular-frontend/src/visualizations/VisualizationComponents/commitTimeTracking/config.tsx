'use strict';

import { connect } from 'react-redux';
import { GlobalState } from '../../../types/globalTypes.ts';

const mapStateToProps = (state: GlobalState) => {
  return {}; //TODO: replace function with actual mapping
};

const mapDispatchToProps = (dispatch: any) => {
  return {}; //TODO: replace function with actual mapping
};

interface Props {} //TODO: replace empty interface

const CommitSpentConfigComponent = (props: Props) => {
  return undefined;
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(CommitSpentConfigComponent);

export default DashboardConfig;
