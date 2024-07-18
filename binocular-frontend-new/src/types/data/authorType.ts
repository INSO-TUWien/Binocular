export interface AuthorType {
  signature: string;
  id: number;
  parent: number;
  color: { main: string; secondary: string };
  selected: boolean;
  displayName?: string;
}
