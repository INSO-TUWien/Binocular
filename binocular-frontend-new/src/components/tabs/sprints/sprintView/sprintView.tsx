import sprintViewStyles from './sprintView.module.scss';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState, useAppDispatch } from '../../../../redux';
import { SprintType } from '../../../../types/data/sprintType.ts';
import { showContextMenu } from '../../../contextMenu/contextMenuHelper.ts';
import editIcon from '../../../../assets/edit_gray.svg';
import deleteIcon from '../../../../assets/delete_red.svg';
import { deleteSprint, sprintToEdit } from '../../../../redux/data/sprintsReducer.ts';

function SprintView(props: { orientation?: string }) {
  const dispatch: AppDispatch = useAppDispatch();

  const sprints = useSelector((state: RootState) => state.sprints.sprintList);

  return (
    <div className={'text-xs'}>
      <div className={props.orientation === 'horizontal' ? sprintViewStyles.timelineHorizontal : sprintViewStyles.timelineVertical}>
        {sprints.map((s: SprintType) => {
          return (
            <div
              key={`sprint${s.name}${new Date(s.startDate).toISOString()}${new Date(s.endDate).toISOString()}`}
              className={sprintViewStyles.sprint}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                showContextMenu(e.clientX, e.clientY, [
                  {
                    label: 'edit',
                    icon: editIcon,
                    function: () => dispatch(sprintToEdit(s)),
                  },
                  {
                    label: 'delete',
                    icon: deleteIcon,
                    function: () => dispatch(deleteSprint(s)),
                  },
                ]);
              }}>
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
