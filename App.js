import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Button, Text, TextInput, TouchableOpacity } from 'react-native';
import { InstantSearch, connectRefinementList } from 'react-instantsearch-native';
import SearchBox from './src/SearchBox';
import InfiniteHits from './src/InfiniteHits';
import RefinementList from './src/RefinementList';
import Filters from './src/Filters';
import { getRecentSearches, getSuggestions, setRecentSearches } from './src/Algolia';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#252b33',
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

const VirtualRefinementList = connectRefinementList(() => null);

class App extends React.Component {
  root = {
    Root: View,
    props: {
      style: {
        flex: 1,
      },
    },
  };

  state = {
    isModalOpen: false,
    searchState: {},
    hits: [],
    recentSearches: []
  };

  async componentDidMount() {
    await this.fetchRecentSearches();
  }

  fetchRecentSearches = async () => {
    const recentSearches = await getRecentSearches("users1");
    this.setState({
      recentSearches
    })
  }

  onChangeText = async (value) => {
    const hits = await getSuggestions(value);
    this.setState({
      hits
    })
  }

  onPress = async(query) => {
    const recentSearches = await setRecentSearches(query, "users1");
    this.setState({
      recentSearches
    })
  }

  toggleModal = () =>
    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
    }));

  onSearchStateChange = searchState =>
    this.setState(() => ({
      searchState,
    }));

  render() {
    const { isModalOpen, searchState } = this.state;

    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <TextInput 
            onChangeText={this.onChangeText} 
            style={{
              width: '100%', 
              height: 50, 
              color: '#000',
              fontSize: 18,
              borderColor: '#000',
              borderWidth: 2,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              padding: 10
            }}
            placeholder='Search..'
          />
          <View style={{width: '100%', backgroundColor: 'grey', borderBottomLeftRadius: 10, borderBottomRightRadius: 10,}}>
            {this.state.recentSearches.length > 0 &&
              <View style={{padding: 10}}>
                <Text style={{fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 10, }}>
                  Recent Searches
                </Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                {
                  this.state.recentSearches.map(ele => {
                    return (
                      <Text style={{color: 'yellow', textDecorationLine: 'underline'}}>
                        {ele}
                      </Text>
                    )
                  })
                }
                </View>
              </View>
            }
            {
              this.state.hits.map(ele => {
                return (
                  <TouchableOpacity 
                    style={{
                      padding: 10, 
                      borderBottomColor: '#fff', 
                      borderBottomWidth: 2
                    }} 
                    onPress={() => this.onPress(ele.brand)}>
                    <Text style={{fontSize: 18}}>
                      {ele.brand}
                    </Text>
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

export default App;
