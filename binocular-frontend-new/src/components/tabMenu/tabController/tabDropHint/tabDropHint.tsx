import tabDropHintStyles from './tabDropHint.module.scss';

function TabDropHint(props: { dragState: boolean }) {
  return (
    <>
      {props.dragState && (
        <div className={tabDropHintStyles.dropZone + ' ' + tabDropHintStyles.dropZoneTop + ' ' + tabDropHintStyles.dropZoneHorizontal}>
          <div>Drop Here</div>
        </div>
      )}
      {props.dragState && (
        <div className={tabDropHintStyles.dropZone + ' ' + tabDropHintStyles.dropZoneRight + ' ' + tabDropHintStyles.dropZoneVertical}>
          <div>Drop Here</div>
        </div>
      )}
      {props.dragState && (
        <div className={tabDropHintStyles.dropZone + ' ' + tabDropHintStyles.dropZoneBottom + ' ' + tabDropHintStyles.dropZoneHorizontal}>
          <div>Drop Here</div>
        </div>
      )}
      {props.dragState && (
        <div className={tabDropHintStyles.dropZone + ' ' + tabDropHintStyles.dropZoneLeft + ' ' + tabDropHintStyles.dropZoneVertical}>
          <div>Drop Here</div>
        </div>
      )}
    </>
  );
}

export default TabDropHint;
