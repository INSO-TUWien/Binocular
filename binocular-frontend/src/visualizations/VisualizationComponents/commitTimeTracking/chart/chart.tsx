import { Palette } from '../../../../types/authorTypes.ts';

interface Props {} //TODO: Replace empty interface

interface CommitChartData {} //TODO: Replace empty interface

export default (props: Props) => {
  return {}; //TODO: Replace empty prop
};

const extractCommitData = (
  props: Props,
): { commitChartData: CommitChartData[]; commitScale: number[]; commitPalette: Palette; selectedAuthors: string[] } => {
  return { commitChartData: [], commitScale: [], commitPalette: {}, selectedAuthors: [] }; //TODO: implement data excraction
};
