export interface SettingsType {
  color: string;
}

function Settings(props: { defaultSettings: SettingsType; setSettings: (newSettings: SettingsType) => void }) {
  return (
    <>
      <div>
        <label htmlFor={'hs-color-input'} className={'block text-sm font-medium mb-2 dark:text-white'}>
          Chart Color
        </label>
        <input
          type={'color'}
          className={'p-1 h-10 w-14 block bg-white bordercursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none  '}
          id={'hs-color-input'}
          value={props.defaultSettings.color}
          title={'Choose your color'}
          onChange={(event) => {
            props.setSettings({ color: event.target.value });
          }}
        />
      </div>
    </>
  );
}

export default Settings;
