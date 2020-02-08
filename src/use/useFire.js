import React from 'react';
import { useSuspense } from './useSuspense.js';

let useFirebaseValueNoSubscribe = useSuspense(
  ref => ref.toString(),
  async ref => {
    let snapshot = await ref.once("value");
    return snapshot.val();
  }
);
let FirebaseContext = React.createContext();

export let fire = {
  Provider: FirebaseContext.Provider,
  useFirebase: () => React.useContext(FirebaseContext),
  useDatabase: () => React.useContext(FirebaseContext).database(),
  onDisconnectEffect: (ref, fn) => {
    let onDisconnect = ref.onDisconnect();
    fn(onDisconnect);
    return () => {
      fn(ref);
      onDisconnect.cancel();
    };
  },
  useValue: ref => {
    let initial_load = useFirebaseValueNoSubscribe(ref);
    let [data, set_data] = React.useState(initial_load);

    React.useEffect(() => {
      let handle = snapshot => {
        set_data(snapshot.val());
      };
      ref.on("value", handle);
      return () => {
        ref.off("value", handle);
      };
    }, [ref.toString()]);

    return data;
  }
};
