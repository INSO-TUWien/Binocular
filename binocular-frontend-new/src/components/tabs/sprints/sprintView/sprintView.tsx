import sprintViewStyles from './sprintView.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux';
import { SprintType } from '../../../../types/data/sprintType.ts';

function SprintView(props: { orientation?: string }) {
  const sprints = useSelector((state: RootState) => state.sprints.sprintList);

  return (
    <div className={'text-xs'}>
      <div className={props.orientation === 'horizontal' ? sprintViewStyles.timelineHorizontal : sprintViewStyles.timelineVertical}>
        {sprints.map((s: SprintType) => {
          return (
            <div
              key={`sprint${s.name}${new Date(s.startDate).toISOString()}${new Date(s.endDate).toISOString()}`}
              className={sprintViewStyles.sprint}>
              <div className={sprintViewStyles.startDate}>{new Date(s.startDate).toDateString()}</div>
              <div>{s.name}</div>
              <div className={sprintViewStyles.endDate}>{new Date(s.endDate).toDateString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SprintView;
