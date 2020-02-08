import React from "react";
import { View, Text, BackHandler } from "react-native";
import { Updates } from "expo";

import { Container, Button } from "./Elements.js";
import { fire } from "./use/useFire.js";

import { ChooseRoom } from "./Pages/ChooseRoom.js";
import { ChooseNickname } from "./Pages/ChooseNickname.js";
import { RoomPage } from "./Pages/RoomPage.js";

let useBackhandler = fn => {
  React.useEffect(() => {
    let handler = BackHandler.addEventListener("harwareBackPress", () => {
      fn();
      return true;
    });
    return () => {
      handler.remove();
    };
  }, []);
};
let Backhandler = ({ onPress }) => {
  useBackhandler(onPress);
  return null;
};

export let Routes = () => {
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
      <React.Fragment key="choose-nickname">
        <Backhandler
          onPress={() => {
            set_room_id(null);
          }}
        />
        <ChooseNickname
          room_id={room_id}
          onChooseNickname={({ id, nickname }) => {
            set_user({ id, nickname });
          }}
        />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment key="room">
      <RemoveRoomErrorBoundary room_id={room_id}>
        <Backhandler
          onPress={() => {
            set_user({
              id: null,
              nickname: null
            });
          }}
        />
        <RoomPage room_id={room_id} id={id} nickname={nickname} />
      </RemoveRoomErrorBoundary>
    </React.Fragment>
  );
};

let asErrorBoundary = Component => {
  return props => {
    return (
      <ErrorBoundary
        children={props.children}
        renderError={error_props => <Component {...props} {...error_props} />}
      />
    );
  };
};
class ErrorBoundary extends React.Component {
  state = {
    error: null
  };

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    let { children } = this.props;
    if (this.state.error) {
      return this.props.renderError({
        error: this.state.error,
        retry: () => {
          this.setState({ error: null });
        }
      });
    } else {
      return children;
    }
  }
}

let RemoveRoomErrorBoundary = asErrorBoundary(({ error, room_id, children }) => {
  let database = fire.useDatabase();
  let room_ref = database.ref(`rooms/${room_id}`);

  return (
    <Container style={{ padding: 16 }}>
      <Text style={{ fontWeight: "bold" }}>You have an error:</Text>
      <Text style={{ fontFamily: "monospace" }}>{error.message}</Text>

      <View style={{ height: 16 }} />

      <Text>Want to purge this room?</Text>
      <Button
        color="red"
        onPress={async () => {
          await room_ref.remove();
          Updates.reloadFromCache();
        }}
      >
        <Button.Text>Purge</Button.Text>
      </Button>
    </Container>
  );
});

export let App = ({ app }) => {
  return (
    <fire.Provider value={app}>
      <Routes />
    </fire.Provider>
  );
};
