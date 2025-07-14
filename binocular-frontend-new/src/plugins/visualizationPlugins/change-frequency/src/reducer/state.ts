export interface ChangeFrequencyState {
  hoveredFile: string | null;
  selectedFile: string | null;
  currentPath: string;
  hierarchyStack: string[];
  hierarchyData: any[];
}
