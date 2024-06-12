export interface Author {
  name: string;
  id: number;
  parent: number;
  color: { main: string; secondary: string };
  selected: boolean;
}
