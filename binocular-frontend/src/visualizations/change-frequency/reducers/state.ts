import { handleActions } from 'redux-actions';
import { HierarchyNode } from '../utils/hierarchy';

export interface ChangeFrequencyState {
  hoveredFile: string | null;
  selectedFile: string | null;
  currentPath: string;
  hierarchyStack: string[];
  hierarchyData: HierarchyNode[];
}

const initialState: ChangeFrequencyState = {
  hoveredFile: null,
  selectedFile: null,
  currentPath: '',
  hierarchyStack: [],
  hierarchyData: [],
};

export default handleActions<ChangeFrequencyState, any>(
  {
    SET_CHANGE_FREQUENCY_STATE: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    HIERARCHY_DATA_LOADED: (state, action) => ({
      ...state,
      hierarchyData: action.payload,
    }),
  },
  initialState,
);
