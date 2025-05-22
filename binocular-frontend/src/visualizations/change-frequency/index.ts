import ChartComponent from './chart';
import ConfigComponent from './config';
import HelpComponent from './help';
import saga from './sagas';
import reducer from './reducers';

interface VisualizationModule {
  id: string;
  label: string;
  saga: any;
  reducer: any;
  ChartComponent: React.ComponentType<any>;
  ConfigComponent: React.ComponentType<any>;
  HelpComponent: React.ComponentType<any>;
}

const changeFrequencyVisualization: VisualizationModule = {
  id: 'changeFrequency',
  label: 'Change Frequency',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
};

export default changeFrequencyVisualization;
