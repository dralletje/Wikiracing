import React from 'react';
import { isEmpty } from "lodash";
import { Text, View, TextInput } from 'react-native';

import { Button, Title, Container } from "../Elements.js";
import { useRoom } from '../use/useRoom.js';

export let ChooseNickname = ({ onChooseNickname, room_id }) => {
  let [nickname, set_nickname] = React.useState("");

  let { room, set_room, room_ref } = useRoom(room_id);
  let players = room.players || {};

  let lowercase_nickname = nickname.trim().toLowerCase();
  let existing_player_with_name = Object.entries(players).find(
    ([id, x]) => x.name === lowercase_nickname
  );

  let join_room = async () => {
    if (lowercase_nickname === "") {
      return;
    }

    if (existing_player_with_name) {
      onChooseNickname({
        id: existing_player_with_name[0],
        nickname: existing_player_with_name[1].name
      });
    } else {
      let id = await room_ref.child(`players`).push({
        name: lowercase_nickname,
        history: room.active ? [room.wiki_start.url] : [],
      });
      onChooseNickname({ id: id.key, nickname: lowercase_nickname });
    }
  };

  return (
    <Container style={{ padding: 16, backgroundColor: "#eee" }}>
      <Title>Choose a nickname</Title>

      <View style={{ height: 16 }} />

      <Text style={{ fontSize: 18, opacity: 0.5 }}>
        You can choose a new username if you never been to this room before.
      </Text>

      <View style={{ flexDirection: "row" }}>
        <TextInput
          value={nickname}
          onChangeText={set_nickname}
          style={{ fontSize: 18, flex: 1 }}
          placeholder="Enter nickname"
        />

        <View style={{ width: 16 }} />

        <Button
          inline
          disabled={
            lowercase_nickname === "" || existing_player_with_name?.[1]?.active
          }
          color="rgb(91, 3, 139)"
          onPress={() => {
            join_room();
          }}
        >
          <Button.Text style={{ fontSize: 18 }}>enter</Button.Text>
        </Button>
      </View>

      <View style={{ height: 32 }} />

      {!isEmpty(room.players) && (
        <View>
          <Text style={{ fontSize: 18, opacity: 0.5 }}>
            Or select an existing username from the players already in room
          </Text>

          <View style={{ height: 8 }} />

          {Object.entries(room.players || {}).map(([id, player]) => (
            <View
              key={id}
              style={{
                alignItems: "center",
                paddingTop: 8,
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
              <Text style={{ fontSize: 18 }}>{player.name}</Text>

              {player.active === true ? (
                <Button
                  inline
                  disabled={true}
                  color="rgb(0, 140, 144)"
                  onPress={() => {}}
                >
                  <Button.Text style={{ fontSize: 18 }}>taken</Button.Text>
                </Button>
              ) : (
                <Button
                  inline
                  color="rgb(0, 140, 144)"
                  onPress={() => {
                    onChooseNickname({ id: id, nickname: player.name });
                  }}
                >
                  <Button.Text style={{ fontSize: 18 }}>select</Button.Text>
                </Button>
              )}
            </View>
          ))}
        </View>
      )}
    </Container>
  );
};
