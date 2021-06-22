import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Button, Text, TextInput, TouchableOpacity } from 'react-native';
import { InstantSearch, connectRefinementList } from 'react-instantsearch-native';
import SearchBox from './src/SearchBox';
import InfiniteHits from './src/InfiniteHits';
import RefinementList from './src/RefinementList';
import Filters from './src/Filters';
import { algoliaSDK, getRecentSearches, getSuggestions, getTopSearches, setRecentSearches } from './src/Algolia';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './src/screens/Home';
import PLP from './src/screens/PLP';

const VirtualRefinementList = connectRefinementList(() => null);

const Stack = createStackNavigator();

class App extends React.Component {
  root = {
    Root: View,
    props: {
      style: {
        flex: 1,
      },
    },
  };

  componentDidMount() {
    algoliaSDK.setIndex();
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="PLP" component={PLP} options={({ route }) => ({ title: route.params.name })} />
        </Stack.Navigator>    
      </NavigationContainer>
    );
  }
}

export default App;
