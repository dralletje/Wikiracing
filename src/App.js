import React from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal
} from "react-native";
import WebView from "react-native-webview";
import { last, debounce, range, mapValues } from "lodash";
import { useObjectVal } from "react-firebase-hooks/database";
import * as firebase from "firebase";

// Initialize Firebase
let app = firebase.initializeApp({
  apiKey: "AIzaSyBSLGxWu0rKt5Qglirqd95yAZE2PYY1CHU",
  authDomain: "wikiracing-93971.firebaseapp.com",
  databaseURL: "https://wikiracing-93971.firebaseio.com",
  projectId: "wikiracing-93971",
  storageBucket: "",
  messagingSenderId: "66848635721",
  appId: "1:66848635721:web:cb57721673d66bf2"
});
let database = app.database();

let title_style = { fontFamily: "Roboto", textAlign: "center", fontSize: 32 };

let Container = ({ children, ...props }) => {
  return (
    <View {...props}>
      <View
        style={{
          height: StatusBar.currentHeight
        }}
      />

      {children}
    </View>
  );
};

let useRoom = room_id => {
  let room_ref = database.ref(`rooms/${room_id}`);
  let [room, loading, error] = useObjectVal(room_ref);

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

  return { room, set_room, set_history, room_ref, loading, error };
};

let ChooseNickname = ({ onChooseNickname, room_id }) => {
  let [nickname, set_nickname] = React.useState("");

  let { room, set_room, room_ref } = useRoom(room_id);

  let join_room = async () => {
    let lowercase = nickname.toLowerCase();
    if (lowercase === "") {
      return;
    }

    try {
      let id = await room_ref.child(`players`).push({
        name: lowercase,
        history: []
      });
      console.log(`id:`, id);
      onChooseNickname({ id: id.key, nickname: lowercase });
    } catch (err) {
      console.log(`err.stack:`, err.stack);
    }
  };

  return (
    <Container style={{ padding: 16 }}>
      <Text style={title_style}>Choose a nickname</Text>

      <View style={{ height: 16 }} />

      <TextInput
        value={nickname}
        style={{ fontSize: 18 }}
        placeholder="Enter nickname"
        onChangeText={set_nickname}
      />

      <View style={{ height: 16 }} />

      <Button
        color="rgb(91, 3, 139)"
        onPress={() => {
          join_room();
        }}
      >
        <Button.Text>Done</Button.Text>
      </Button>

      <View style={{ height: 32 }} />

      <View>
        <Text style={{ fontSize: 18 }}>Players already in room</Text>
        <View style={{ height: 8 }} />
        {Object.entries(room.players || {}).map(([id, player]) => (
          <View
            key={id}
            style={{
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "gray",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <Text style={{ fontSize: 24 }}>{player.name}</Text>
            <Button
              color="rgb(0, 140, 144)"
              onPress={() => {
                onChooseNickname({ id: id, nickname: player.name });
              }}
            >
              <Button.Text>select</Button.Text>
            </Button>
          </View>
        ))}
      </View>
    </Container>
  );
};

let ChooseRoom = ({ onSelect }) => {
  let [room_id, set_room_id] = React.useState("");

  let submit_room_id = async () => {
    onSelect(room_id);
  };

  return (
    <Container
      style={{
        flex: 1,
        backgroundColor: "#eee"
      }}
    >
      <View style={{ height: 16 }} />
      <Text style={title_style}>Wiki-racing!</Text>
      <View style={{ height: 32 }} />
      <View style={{ flexDirection: "row", paddingHorizontal: 16 }}>
        <TextInput
          placeholder="Room name"
          style={{ flex: 1, textAlign: "center", fontSize: 24 }}
          value={room_id}
          onChangeText={text => {
            let normalized_text = text.replace(/[^0-9a-zA-Z]/g, "");
            set_room_id(normalized_text);
          }}
        />
        <Button
          color="rgb(0, 191, 8)"
          onPress={() => {
            submit_room_id();
          }}
        >
          <Button.Text>join!</Button.Text>
        </Button>
      </View>
    </Container>
  );
};

let App = () => {
  let [room_id, set_room_id] = React.useState(null);
  let [{ id, nickname }, set_user] = React.useState({
    id: null,
    nickname: null
  });

  if (room_id == null) {
    return (
      <ChooseRoom
        onSelect={room_id => {
          set_room_id(room_id);
        }}
      />
    );
  }

  if (id == null || nickname == null) {
    return (
      <ChooseNickname
        room_id={room_id}
        onChooseNickname={({ id, nickname }) => {
          set_user({ id, nickname });
        }}
      />
    );
  }

  return <RoomPage room_id={room_id} id={id} nickname={nickname} />;
};

class FindArticle extends React.Component {
  state = {
    active: false,
    typing: "",
    results: []
  };

  do_search = debounce(async () => {
    let { typing } = this.state;
    let query = typing;
    let response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&redirects=resolve&search=${query}`
    );
    let json = await response.json();

    if (this.state.typing !== json[0]) {
      return;
    }

    let results = range(0, json[1].length).map(index => {
      return {
        title: json[1][index],
        description: json[2][index],
        url: json[3][index]
      };
    });
    this.setState({
      results: results
    });
  }, 500);

  render() {
    let { value, onChange } = this.props;
    let { active, typing, results } = this.state;

    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            this.setState({
              active: true,
              typing: ""
            });
          }}
        >
          <View>
            <Text style={{ fontSize: 16, opacity: value == null ? 0.7 : 1 }}>
              {value ? value.title : "Click to select article"}
            </Text>
          </View>
        </TouchableOpacity>

        <Modal visible={active} animationType="slide" transparent={false}>
          <Container style={{ flex: 1, backgroundColor: "#eee", backgroundColor: "white" }}>
            <View
              style={{
                flexDirection: "row",
                padding: 16,
                alignItems: "center"
              }}
            >
              <TextInput
                placeholder="Search for article"
                style={{ flex: 1 }}
                value={typing}
                onChangeText={text => {
                  this.do_search();
                  this.setState({
                    typing: text
                  });
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    active: false,
                    typing: ""
                  });
                }}
              >
                <View style={{ paddingHorizontal: 16 }}>
                  <Text>X</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ height: 16 }} />

            <View>
              {results.map(result => (
                <TouchableOpacity
                  key={result.url}
                  onPress={() => {
                    onChange(result);
                    this.setState({ active: false });
                  }}
                  style={{ padding: 16 }}
                >
                  <View>
                    <Text style={{ fontSize: 24 }}>{result.title}</Text>
                  </View>
                  <View>
                    <Text>{result.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Container>
        </Modal>
      </View>
    );
  }
}

let Button = ({ color, children, style, disabled, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        if (disabled === true) {
          return;
        } else {
          onPress();
        }
      }}
      style={[
        {
          padding: 12,
          backgroundColor: disabled ? "rgb(99, 99, 99)" : color,
          color: "white",
          borderRadius: 4,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row"
        },
        style
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};
Button.Text = ({ style, ...props }) => {
  return <Text style={[{ color: "white" }, style]} {...props} />;
};

class PreGame extends React.Component {
  render() {
    let { game, onGameChange } = this.props;

    return (
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row" }}>
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
        <View style={{ flexDirection: "row" }}>
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
          onPress={() => {
            onGameChange({
              players: mapValues(game.players, player => {
                return {
                  ...player,
                  history: [],
                };
              }),
              active: true,
              last_event: null,
            });
          }}
          color="rgb(199, 127, 217)"
        >
          <Button.Text>Start!</Button.Text>
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
      </View>
    );
  }
}

let RoomPage = ({ room_id, id, nickname }) => {
  let { room, set_room, set_history } = useRoom(room_id);

  return (
    <Container style={{ backgroundColor: "#eee", flex: 1 }}>
      {room.active !== true && (
        <View style={{ flex: 1 }}>
          <View style={{ padding: 16 }}>
            <Text style={title_style}>Room: {room_id}</Text>
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
          <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={{ fontSize: 16 }}>Goal: {room.wiki_end.title}</Text>
            </View>

            {room.last_event && <View>
              <Text style={{ backgroundColor: player_color(nickname), padding: 3, paddingHorizontal: 8, borderRadius: 10, color: 'white' }}>
                <Text style={{ color: '#eee' }}>{room.last_event.nickname}: </Text>
                {get_wiki_subject(room.last_event.page)}
              </Text>
            </View>}
          </View>
          <Game
            game={room}
            history={room.players[id].history || []}
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
                      page: last(history),
                    }
                  })
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

export class Game extends React.Component {
  webview = null;

  render() {
    let { game, history, onHistoryChange } = this.props;

    return (
      <View style={{ flex: 1 }}>
        <WebView
          ref={webview_ref => {
            this.webview = webview_ref;
          }}
          style={{ flex: 1 }}
          source={{ uri: game.wiki_start.url }}
          onNavigationStateChange={navstate => {
            let subject = get_wiki_subject(navstate.url);
            if (subject == null) {
              if (navstate.loading === false) {
                this.webview.goBack();
              }
            } else {
              if (last(history) !== navstate.url) {
                onHistoryChange([...history, navstate.url]);
              }
            }
          }}
        />
      </View>
    );
  }
}

// From https://materialuicolors.co/
let colors = ['#F44336', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#FF9800', '#FFC107', '#795548', '#607D8B'];
let player_color = (name) => {
  let score = name.split('').reduce((n, character) => {
    return n + character.charCodeAt(0);
  }, 0);
  return colors[score % colors.length];
}

let get_wiki_subject = url => {
  let match = url.match(/https?:\/\/en\.(?:m\.)?wikipedia\.org\/wiki\/(.*)/);
  if (match == null) {
    return null;
  } else {
    return match[1].replace(/_/g, ' ');
  }
};
