import sprintViewStyles from './sprintView.module.scss';
import { useSelector } from 'react-redux';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../../redux';
import type { SprintType } from '../../../../types/data/sprintType.ts';
import { showContextMenu } from '../../../contextMenu/contextMenuHelper.ts';
import editIcon from '../../../../assets/edit_gray.svg';
import deleteIcon from '../../../../assets/delete_red.svg';
import { deleteSprint, sprintToEdit } from '../../../../redux/reducer/data/sprintsReducer.ts';
import { Icon } from '../../../icon';

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
              className={`${sprintViewStyles.sprint} group`}
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
              <div className={sprintViewStyles.startDate}>
                {new Date(s.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className={'flex items-center justify-between'}>
                <span>{s.name}</span>
                <div className={'flex gap-0.5 opacity-0 group-hover:opacity-100'}>
                  <button
                    className={'hover:opacity-70'}
                    title={'Edit sprint'}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(sprintToEdit(s));
                    }}>
                    <Icon name="edit" size="w-3 h-3" />
                  </button>
                  <button
                    className={'hover:opacity-70'}
                    title={'Delete sprint'}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(deleteSprint(s));
                    }}>
                    <Icon name="delete" colorClass="error" size="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className={sprintViewStyles.endDate}>
                {new Date(s.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SprintView;
