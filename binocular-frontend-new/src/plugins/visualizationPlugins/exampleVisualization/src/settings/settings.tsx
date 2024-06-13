export interface SettingsType {
  data: { x: number; y: number }[];
  color: string;
}

function Settings(props: { settings: SettingsType; setSettings: (newSettings: SettingsType) => void }) {
  const data1 = [
    { x: 1, y: 90 },
    { x: 2, y: 80 },
    { x: 3, y: 34 },
    { x: 4, y: 53 },
    { x: 5, y: 52 },
    { x: 6, y: 9 },
    { x: 7, y: 18 },
    { x: 8, y: 78 },
    { x: 9, y: 28 },
    { x: 10, y: 34 },
  ];
  const data2 = [
    { x: 1, y: -28 },
    { x: 2, y: -30 },
    { x: 3, y: -18 },
    { x: 4, y: -9 },
    { x: 5, y: -52 },
    { x: 6, y: -53 },
    { x: 7, y: -34 },
    { x: 8, y: -78 },
    { x: 9, y: -90 },
  ];

  return (
    <>
      <div>
        <button
          className={'btn btn-xs btn-accent w-full mb-1'}
          onClick={() => {
            props.setSettings({ data: data1, color: props.settings.color });
          }}>
          Dataset 1
        </button>
        <button
          className={'btn btn-xs btn-accent w-full mb-1'}
          onClick={() => {
            props.setSettings({ data: data2, color: props.settings.color });
          }}>
          Dataset 2
        </button>
        <div>
          <label htmlFor={'hs-color-input'} className={'block text-sm font-medium mb-2 dark:text-white'}>
            Chart Color
          </label>
          <input
            type={'color'}
            className={'p-1 h-10 w-14 block bg-white bordercursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none  '}
            id={'hs-color-input'}
            value={props.settings.color}
            title={'Choose your color'}
            onChange={(event) => {
              props.setSettings({ data: props.settings.data, color: event.target.value });
            }}
          />
        </div>
      </div>
    </>
  );
}

export default Settings;
