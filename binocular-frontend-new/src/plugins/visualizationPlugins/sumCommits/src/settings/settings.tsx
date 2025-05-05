import { useEffect, useState } from 'react';

export interface SettingsType {
  showMean: boolean;
  showOther: boolean;
}

interface SettingsProps {
  settings: SettingsType;
  setSettings: (newSettings: SettingsType) => void;
  users: string[];
}

function Settings({ settings, setSettings, users }: SettingsProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => setSelectedUsers(users), [users]);

  const toggleUser = (user: string) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== user));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <>
      <div>
        <label className="label cursor-pointer">
          <span className="label-text">Show Mean:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={settings.showMean}
            onChange={(event) =>
              setSettings({
                ...settings,
                showMean: event.target.checked,
              })
            }
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Show unknown authors:</span>
          <input
            type="checkbox"
            className="toggle toggle-accent toggle-sm"
            defaultChecked={settings.showOther}
            onChange={(event) =>
              setSettings({
                ...settings,
                showOther: event.target.checked,
              })
            }
          />
        </label>
      </div>

      <div className="divider my-0" />

      <span className="label-text">Combine users:</span>
      <div className="flex flex-wrap gap-4">
        {users.map((u) => (
          <label key={u} className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={selectedUsers.includes(u)}
              onChange={() => toggleUser(u)}
            />
            <span className="label-text">{u}</span>
          </label>
        ))}
      </div>

      <button
        className="btn btn-accent btn-sm"
        disabled={selectedUsers.length < 2}
        onClick={() => {
          //TODO: Add the combine logic
        }}>
        Combine
      </button>
    </>
  );
}

export default Settings;
