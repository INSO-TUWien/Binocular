import { useEffect, useState } from 'react';

export interface SettingsType {
  showMean: boolean;
  showOther: boolean;
  combinedUsers: string[][];
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

  const combinedUsers = settings.combinedUsers ?? [];

  const combineUsers = () => {
    if (selectedUsers.length < 2) return;

    setSettings({
      ...settings,
      combinedUsers: [...combinedUsers, [...selectedUsers]],
    });
    setSelectedUsers([]);
  };

  const uncombineUsers = () => {
    if (selectedUsers.length < 2) return;

    const newCombinedUsers = combinedUsers.filter((group) => {
      !group.every((u) => selectedUsers.includes(u));
    });

    setSettings({
      ...settings,
      combinedUsers: newCombinedUsers,
    });
    setSelectedUsers([]);
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
          combineUsers();
        }}>
        Combine
      </button>

      <button className="btn btn-accent btn-sm" onClick={uncombineUsers} style={{ marginLeft: '0.5rem' }}>
        Uncombine
      </button>
    </>
  );
}

export default Settings;
