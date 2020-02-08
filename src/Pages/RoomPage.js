import React from "react";
import { mapValues, last } from "lodash";
import { Text, View } from "react-native";

import { Button, Title, Container } from "../Elements.js";
import { useRoom } from "../use/useRoom.js";
import { fire } from "../use/useFire.js";

import {
  WikipediaView,
  get_wiki_subject
} from "../Components/WikipediaView.js";
import { FindArticle } from "../Components/FindArticle.js";

export let RoomPage = ({ room_id, id, nickname }) => {
  let { room, set_room, set_history, room_ref } = useRoom(room_id);

  let user_ref = room_ref.child(`players/${id}`);
  React.useEffect(() => {
    user_ref.update({ active: true });
    return () => user_ref.update({ active: false });
  }, [user_ref.toString()]);

  React.useEffect(
    fire.onDisconnectEffect(user_ref, disconnect_ref => {
      disconnect_ref.update({ active: false });
    }),
    [user_ref.toString()]
  );

  return (
    <Container style={{ backgroundColor: "#eee", flex: 1 }}>
      {room.active !== true && (
        <View style={{ flex: 1 }}>
          <View style={{ padding: 16 }}>
            <Title>Room: {room_id}</Title>
          </View>

          <View style={{ height: 16 }} />

          <PreGame
            game={room}
            onGameChange={new_game => {
              set_room(new_game);
            }}
          />
        </View>
      )}

      {room.active === true && (
        <View style={{ flex: 1 }}>
          <View
            style={{
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontSize: 16 }}>🏁 {room.wiki_end.title}</Text>
            </View>

            {room.last_event && (
              <View>
                <Text
                  style={{
                    backgroundColor: player_color(nickname),
                    padding: 3,
                    paddingHorizontal: 8,
                    borderRadius: 10,
                    color: "white"
                  }}
                >
                  <Text style={{ color: "#eee" }}>
                    {room.last_event.nickname}:{" "}
                  </Text>
                  {get_wiki_subject(room.last_event.page)}
                </Text>
              </View>
            )}
          </View>
          <WikipediaView
            history={room.players[id]?.history || [room.wiki_start.url]}
            onHistoryChange={history => {
              try {
                let subject_last = get_wiki_subject(last(history));
                let subject_end = get_wiki_subject(room.wiki_end.url);
                if (subject_last === subject_end) {
                  set_room({
                    wiki_start: null,
                    wiki_end: null,
                    active: false,
                    last_event: null,
                    winner: {
                      wiki_start: room.wiki_start,
                      wiki_end: room.wiki_end,
                      id: id,
                      nickname: nickname
                    }
                  });
                  set_history(id, history);
                } else {
                  set_room({
                    last_event: {
                      id: id,
                      nickname: nickname,
                      page: last(history)
                    }
                  });
                  set_history(id, history);
                }
              } catch (err) {
                console.error(err.stack);
              }
            }}
          />
        </View>
      )}
    </Container>
  );
};

class PreGame extends React.Component {
  render() {
    let { game, onGameChange } = this.props;

    return (
      <Container style={{ paddingHorizontal: 16, backgroundColor: "#eee" }}>
        <View style={{ flexDirection: "column" }}>
          <Text style={{ fontSize: 18 }}>Players in the room</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {Object.entries(game.players || {})
              .filter(([id, player]) => player.active)
              .map(([id, player]) => (
                <Text
                  style={{
                    marginBottom: 8,
                    marginRight: 8,
                    color: player_color(player.name),
                    fontSize: 18
                  }}
                >
                  {player.name}
                </Text>
              ))}
          </View>
        </View>

        <View style={{ height: 16 }} />

        <View style={{ flexDirection: "column" }}>
          <Text style={{ fontSize: 16 }}>Origin: </Text>
          <FindArticle
            value={game.wiki_start}
            onChange={wiki_start => {
              onGameChange({
                wiki_start: wiki_start
              });
            }}
          />
        </View>

        <View style={{ height: 16 }} />

        <View style={{ flexDirection: "column" }}>
          <Text style={{ fontSize: 16 }}>Destination: </Text>
          <FindArticle
            value={game.wiki_end}
            onChange={wiki_end => {
              onGameChange({
                wiki_end: wiki_end
              });
            }}
          />
        </View>

        <View style={{ height: 16 }} />

        <Button
          disabled={game.wiki_start == null || game.wiki_end == null}
          onPress={() => {
            onGameChange({
              players: mapValues(game.players, player => {
                return {
                  ...player,
                  history: [game.wiki_start.url]
                };
              }),
              active: true,
              last_event: null
            });
          }}
          color="rgb(199, 127, 217)"
        >
          <Button.Text style={{ fontWeight: "bold", letterSpacing: 3 }}>
            Start!
          </Button.Text>
        </Button>

        <View style={{ height: 32 }} />

        {game.winner && (
          <View>
            <View>
              <Text style={{ fontSize: 24, opacity: 0.7 }}>Previous game:</Text>
            </View>
            <View>
              <Text style={{ fontSize: 24 }}>
                <Text style={{ color: "rgb(38, 190, 0)" }}>
                  {game.winner.wiki_start.title}
                </Text>
                <Text style={{ color: "rgb(190, 0, 0)" }}> ➡️ </Text>
                <Text style={{ color: "rgb(0, 97, 145)" }}>
                  {game.winner.wiki_end.title}
                </Text>
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 24 }}>
                <Text>Winner: </Text>
                <Text style={{ color: "rgb(190, 0, 0)" }}>
                  🎉 {game.winner.nickname} 🏆
                </Text>
              </Text>
            </View>
          </View>
        )}
      </Container>
    );
  }
}

// From https://materialuicolors.co/
let colors = [
  "#F44336",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#009688",
  "#4CAF50",
  "#FF9800",
  "#FFC107",
  "#795548",
  "#607D8B"
];
let player_color = name => {
  let score = name.split("").reduce((n, character) => {
    return n + character.charCodeAt(0);
  }, 0);
  return colors[score % colors.length];
};
