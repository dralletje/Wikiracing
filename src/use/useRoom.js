import { fire } from "../use/useFire.js";

export let useRoom = room_id => {
  let database = fire.useDatabase();
  let room_ref = database.ref(`rooms/${room_id}`);
  let room = fire.useValue(room_ref);

  room = room || {
    players: {},
    wiki_start: null,
    wiki_end: null,
    active: false
  };

  let set_room = async value => {
    await room_ref.update(value);
  };
  let set_history = async (player_id, history) => {
    await room_ref.child(`players/${player_id}/history`).set(history);
  };

  return { room, set_room, set_history, room_ref };
};
