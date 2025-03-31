export interface SettingsType {
  data: {
    nodes: { id: string; group: string }[];
    links: { source: string; target: string; value: number }[];
  };
  color: string;
}

function Settings(props: {
  settings: SettingsType;
  setSettings: (newSettings: SettingsType) => void;
}) {
  const data1 = {
    nodes: [
      { id: "Myriel", group: "team1" },
      { id: "Anne", group: "team1" },
      { id: "Gabriel", group: "team1" },
      { id: "Mel", group: "team1" },
      { id: "Yan", group: "team2" },
      { id: "Tom", group: "team2" },
      { id: "Cyril", group: "team2" },
      { id: "Tuck", group: "team2" },
      { id: "Antoine", group: "team3" },
      { id: "Rob", group: "team3" },
      { id: "Napoleon", group: "team3" },
      { id: "Toto", group: "team4" },
      { id: "Tutu", group: "team4" },
      { id: "Titi", group: "team4" },
      { id: "Tata", group: "team4" },
      { id: "Turlututu", group: "team4" },
      { id: "Tita", group: "team4" },
    ],
    links: [
      { source: "Anne", target: "Myriel", value: 1 },
      { source: "Napoleon", target: "Myriel", value: 1 },
      { source: "Gabriel", target: "Myriel", value: 1 },
      { source: "Mel", target: "Myriel", value: 1 },
      { source: "Yan", target: "Tom", value: 1 },
      { source: "Tom", target: "Cyril", value: 1 },
      { source: "Tuck", target: "Myriel", value: 1 },
      { source: "Tuck", target: "Mel", value: 1 },
      { source: "Tuck", target: "Myriel", value: 1 },
      { source: "Mel", target: "Myriel", value: 2 },
      { source: "Rob", target: "Antoine", value: 1 },
      { source: "Tata", target: "Tutu", value: 1 },
      { source: "Tata", target: "Titi", value: 1 },
      { source: "Tata", target: "Toto", value: 1 },
      { source: "Tata", target: "Tita", value: 3 },
      { source: "Tita", target: "Toto", value: 3 },
      { source: "Tita", target: "Titi", value: 3 },
      { source: "Tita", target: "Turlututu", value: 5 },
      { source: "Rob", target: "Turlututu", value: 10 },
    ],
  };
  const data2 = {
    nodes: [
      { id: "Myriel", group: "team1" },
      { id: "Anne", group: "team1" },
      { id: "Gabriel", group: "team1" },
      { id: "Mel", group: "team1" },
      { id: "Yan", group: "team2" },
      { id: "Tom", group: "team2" },
      { id: "Cyril", group: "team2" },
      { id: "Tuck", group: "team2" },
      { id: "Antoine", group: "team3" },
      { id: "Rob", group: "team3" },
      { id: "Napoleon", group: "team3" },
      { id: "Toto", group: "team4" },
      { id: "Tutu", group: "team4" },
      { id: "Titi", group: "team4" },
      { id: "Tata", group: "team4" },
      { id: "Turlututu", group: "team4" },
      { id: "Tita", group: "team4" },
    ],
    links: [
      { source: "Anne", target: "Myriel", value: 1 },
      { source: "Napoleon", target: "Myriel", value: 1 },
      { source: "Gabriel", target: "Myriel", value: 1 },
      { source: "Mel", target: "Myriel", value: 1 },
      { source: "Yan", target: "Tom", value: 1 },
      { source: "Tom", target: "Cyril", value: 1 },
      { source: "Tuck", target: "Myriel", value: 1 },
      { source: "Tuck", target: "Mel", value: 1 },
      { source: "Tuck", target: "Myriel", value: 1 },
      { source: "Mel", target: "Myriel", value: 2 },
      { source: "Rob", target: "Antoine", value: 1 },
      { source: "Tata", target: "Tutu", value: 1 },
      { source: "Tata", target: "Titi", value: 1 },
      { source: "Tata", target: "Toto", value: 1 },
      { source: "Tata", target: "Tita", value: 100 },
      { source: "Tita", target: "Toto", value: 10 },
      { source: "Tita", target: "Titi", value: 10 },
      { source: "Tita", target: "Turlututu", value: 10 },
      { source: "Rob", target: "Turlututu", value: 10 },
    ],
  };

  return (
    <>
      <div>
        <button
          className={"btn btn-xs btn-accent w-full mb-1"}
          onClick={() => {
            props.setSettings({ data: data1, color: props.settings.color });
          }}
        >
          Dataset 1
        </button>
        <button
          className={"btn btn-xs btn-accent w-full mb-1"}
          onClick={() => {
            props.setSettings({ data: data2, color: props.settings.color });
          }}
        >
          Dataset 2
        </button>
        <div>
          <label
            htmlFor={"hs-color-input"}
            className={"block text-sm font-medium mb-2 dark:text-white"}
          >
            Chart Color
          </label>
          <input
            type={"color"}
            className={
              "p-1 h-10 w-14 block bg-white bordercursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none  "
            }
            id={"hs-color-input"}
            value={props.settings.color}
            title={"Choose your color"}
            onChange={(event) => {
              props.setSettings({
                data: props.settings.data,
                color: event.target.value,
              });
            }}
          />
        </div>
      </div>
    </>
  );
}

export default Settings;
