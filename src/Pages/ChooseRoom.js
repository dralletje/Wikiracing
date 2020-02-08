import React from "react";
import { View, TextInput } from "react-native";

import { Container, Button, Title } from "../Elements.js";

export let ChooseRoom = ({ onSelect }) => {
  let [room_id, set_room_id] = React.useState("");

  let submit_room_id = async () => {
    onSelect(room_id.toLowerCase());
  };

  return (
    <Container
      style={{
        flex: 1,
        backgroundColor: "#eee"
      }}
    >
      <View style={{ height: 16 }} />
      <Title>Wiki-racing!</Title>
      <View style={{ height: 32 }} />
      <View style={{ flexDirection: "row", paddingHorizontal: 16 }}>
        <TextInput
          placeholder="Room name"
          style={{ flex: 1, textAlign: "center", fontSize: 24 }}
          value={room_id}
          onChangeText={text => {
            let normalized_text = text.replace(/[^0-9a-zA-Z_$\-]/g, "");
            set_room_id(normalized_text);
          }}
        />
        <Button
          inline
          disabled={room_id === ""}
          color="rgb(0, 191, 8)"
          onPress={() => {
            submit_room_id();
          }}
        >
          <Button.Text style={{ fontSize: 18 }}>join!</Button.Text>
        </Button>
      </View>
    </Container>
  );
};
