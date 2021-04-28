import { useEffect, useState } from 'react';
import type firebaseType from 'firebase';
import { useAtomValue } from 'jotai/utils';
import { firebaseRefAtom } from '../atoms/firebaseAtoms';

export type User = {
  color: string;
  id: string;
  name: string;
  permission: 'OWNER' | 'READ_WRITE' | 'READ';
  connections: { [key: string]: number };
};

export const isUserOnline = (user: User): boolean => {
  return Object.keys(user?.connections || {}).length > 0;
};

export function useOnlineUsers(): User[] | null {
  const firebaseRef = useAtomValue(firebaseRefAtom);

  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    if (firebaseRef) {
      const handleChange = (snap: firebaseType.database.DataSnapshot) => {
        if (!snap.exists()) return;
        const users = Object.keys(snap.val()).map(id => ({
          id,
          ...snap.val()[id],
        }));
        setUsers(users);
        // pass info to firepad so they can render user name on selection
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window['firepadUsers'] = users;
      };
      firebaseRef.child('users').on('value', handleChange);
      return () => firebaseRef.child('users').off('value', handleChange);
    }
  }, [firebaseRef]);

  return users;
}
