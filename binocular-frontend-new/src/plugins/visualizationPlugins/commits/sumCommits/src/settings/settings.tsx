import { useEffect, useMemo, useState } from 'react';
import type { RootState } from '../../../../../../redux';
import { useSelector } from 'react-redux';

export interface SettingsType {
  showMean: boolean;
  showOther: boolean;
  combinedUsers: string[][];
}

interface SettingsProps {
  settings: SettingsType;
  setSettings: (newSettings: SettingsType) => void;
}

function Settings({ settings, setSettings }: SettingsProps) {
  const authors = useSelector((s: RootState) => {
    const id = s.authors.dataPluginId;

    return id == null ? [] : (s.authors.authorLists[id] ?? []);
  });

  const users = useMemo(
    () => authors.map((a) => a.displayName ?? a.user?.gitSignature ?? a.user?.name ?? a.user?.id).filter(Boolean) as string[],
    [authors],
  );

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    setSelectedUsers(users);
  }, [users]);

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
          <span className="label-text">Show other authors:</span>
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
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {users.map((u) => (
          <label key={u} className="label cursor-pointer gap-2 min-w-0 justify-start">
            <input
              type="checkbox"
              className="checkbox checkbox-primary checkbox-sm"
              checked={selectedUsers.includes(u)}
              onChange={() => toggleUser(u)}
            />
            <span className="truncate max-w-[6rem]">{u}</span>
          </label>
        ))}
      </div>

      <button
        className="btn btn-accent btn-sm mt-6"
        disabled={selectedUsers.length < 2}
        onClick={() => {
          combineUsers();
        }}>
        Combine
      </button>

      <button className="btn btn-accent btn-sm mt-6" onClick={uncombineUsers} style={{ marginLeft: '0.5rem' }}>
        Uncombine
      </button>
    </>
  );
}

export default Settings;
