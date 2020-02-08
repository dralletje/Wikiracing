import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { debounce, range } from 'lodash';
import querystring from 'querystring';

import { Container } from '../Elements.js';

export class FindArticle extends React.Component {
  state = {
    active: false,
    typing: "",
    results: []
  };

  do_search = debounce(async () => {
    let { typing } = this.state;
    let query = typing;

    // Descriptions (json[2][index]) will now always be an empty string
    // https://phabricator.wikimedia.org/T241437
    
    let response = await fetch(
      `https://en.wikipedia.org/w/api.php?`+
      querystring.encode({
        origin: '*',
        action: 'opensearch',
        redirects: 'resolve',
        search: query,
      })
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
            <Text style={{ fontSize: 20, opacity: value == null ? 0.5 : 1 }}>
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
