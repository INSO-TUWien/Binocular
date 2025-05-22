import { handleActions } from 'redux-actions';
import _ from 'lodash';

export interface FileChangeData {
  path: string;
  commitCount: number;
  totalAdditions: number;
  totalDeletions: number;
  totalChanges: number;
  averageChangesPerCommit?: number;
  lineCount?: number;
  commits: string[];
  firstModification?: string;
  lastModification?: string;
  owners?: {
    [author: string]: {
      additions: number;
      deletions: number;
      changes: number;
    }
  };
}

export interface ChangeFrequencyDataState {
  loading: boolean;
}

const initialState: ChangeFrequencyDataState = {
  loading: false,
};

export default handleActions<ChangeFrequencyDataState, any>(
  { 
    // Data are still being loaded from the database
    HIERARCHY_DATA_START_LOADING: (state) => ({
      ...state,
      loading: true,
    }),

    // Data are loaded from the database, either with actual data or empty
    HIERARCHY_DATA_LOADED: (state) => ({
      ...state,
      loading: false,
    }),
  },
  initialState
); 