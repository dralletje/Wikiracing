import React from 'react';
import { View, StatusBar, TouchableOpacity, Text } from 'react-native';

export let Container = ({ children, style, ...props }) => {
  return (
    <View {...props} style={[{ flex: 1 }, style]}>
      <View
        style={{
          height: StatusBar.currentHeight,
        }}
      />

      {children}
    </View>
  );
};

let title_style = { fontFamily: "Roboto", textAlign: "center", fontSize: 32 };
export let Title = ({ style, ...props }) => {
  return <Text {...props} style={[title_style, style]} />
}

let ButtonContext = React.createContext({ color: null, inline: false, disabled: false });
export let Button = ({ inline = false, color, children, style, disabled, onPress }) => {
  return (
    <ButtonContext.Provider value={{ inline, color, disabled }}>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => {
          if (disabled === true) {
            return;
          } else {
            onPress();
          }
        }}
        style={[
          {
            paddingHorizontal: 12,
            paddingVertical: inline ? 4 : 12,
            backgroundColor: inline ? 'transparent' : color,
            borderRadius: 4,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            opacity: disabled ? .3 : 1,
          },
          style
        ]}
      >
        {children}
      </TouchableOpacity>
    </ButtonContext.Provider>
  );
};
let ButtonText = ({ style, ...props }) => {
  let { color, disabled, inline } = React.useContext(ButtonContext);
  if (inline) {
    return <Text style={[{ color: color, fontWeight: 'bold' }, style]} {...props} />;
  } else {
    return <Text style={[{ color: "white" }, style]} {...props} />;
  }
};
Button.Text = ButtonText;
