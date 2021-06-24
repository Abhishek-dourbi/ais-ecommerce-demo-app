import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Button, Text, TextInput, TouchableOpacity } from 'react-native';
import { algoliaSDK, getRecentSearches, getSuggestions, getTopSearches, setRecentSearches, sourceIndexName } from '../Algolia';

const genders = {
    'all': {
      label: 'All',
      value: 'all'
    },
    'women': {
      label: 'Women',
      value: 'women'
    },
    'men': {
      label: 'Men',
      value: 'men'
    },
    'kids': {
      label: 'Kids',
      value: 'kids'
    }
};

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

class Home extends React.Component {
    state = {
        isModalOpen: false,
        searchState: {},
        hits: [],
        recentSearches: [],
        topSearches: [],
        selectedGender: 'women',
        value: ''
    };

    async componentDidMount() {
        await this.fetchRecentSearches();
        await this.fetchTopSearches();
    }

    fetchTopSearches = async() => {
        const topSearches = await getTopSearches();
        this.setState({
            topSearches: topSearches.filter(ele => ele !== "") || []
        });
    }

    fetchRecentSearches = async () => {
        const recentSearches = await getRecentSearches("users1");
        this.setState({
            recentSearches: recentSearches || []
        })
    }

    onChangeText = async (value) => {
        const hits = await getSuggestions(this.state.selectedGender === 'all' ? value : `${genders[this.state.selectedGender].value} ${value}`);
        this.setState({
            value,
            hits: hits || []
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

    onGenderPress = gender => 
        this.setState({
            selectedGender: gender
        })

    getQuery = (searchQuery, defaultRouteQuery) => {
        return {
            q: searchQuery,
            ...defaultRouteQuery
        }
    }

    onSuggestionPress = ({query, ...rest}) => {
        const brand_name = rest[sourceIndexName].facets.exact_matches.brand_name[0].value;
        
        let params = {
            q: query,
            ["categories.level0"]: this.state.selectedGender
        };
        if(query.toUpperCase().includes(brand_name.toUpperCase())) {
            params = {...params, brand_name};
        }        
        this.props.navigation.navigate('PLP', {
            params,
            title: query
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevState.selectedGender !== this.state.selectedGender && this.state.value) {
            this.onChangeText(this.state.value);
        }
    }

    fomatQuery = (query) => {
        if(this.state.selectedGender === "all") return query;
        let regex = new RegExp("\\b" + this.state.selectedGender + "\\b");
        return query.replace(regex, "").replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
    }

    render() {
        const { isModalOpen, searchState, selectedGender } = this.state;    

        return (
            <SafeAreaView style={styles.safe}>
                <StatusBar barStyle="light-content" />
                <View style={styles.container}>
                    <View style={{
                        flexDirection: 'row',
                        alignSelf: 'flex-start',
                        marginBottom: 20
                    }}>
                    {
                        Object.values(genders).map(({label, value}) => {
                            return (
                                <TouchableOpacity onPress={() => this.onGenderPress(value)} style={{
                                    backgroundColor: selectedGender === value ? 'grey' : 'white',
                                    borderColor: 'black',
                                    borderWidth: 2,
                                    marginRight: 10,
                                    borderRadius: 10,
                                    padding: 10
                                }}>
                                <Text style={{
                                    color: selectedGender === value ? 'white' : 'black'
                                }}>
                                    {label}
                                </Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                    </View>
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
                        {
                            this.state.topSearches.length > 0 &&
                                <View style={{padding: 10}}>
                                    <Text style={{fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 10, }}>
                                        Top Searches
                                    </Text>
                                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                                    {
                                        this.state.topSearches.map(ele => {
                                            return (
                                            <Text style={{color: 'yellow', textDecorationLine: 'underline', marginBottom: 10, marginRight: 10}}>
                                                {ele.search}
                                            </Text>
                                            )
                                        })
                                    }
                                    </View>
                                </View>
                        }
                        {
                            this.state.recentSearches.length > 0 &&
                                <View style={{padding: 10}}>
                                    <Text style={{fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 10, }}>
                                        Recent Searches
                                    </Text>
                                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                                    {
                                    this.state.recentSearches.map(ele => {
                                        return (
                                        <Text style={{color: 'yellow', textDecorationLine: 'underline', marginBottom: 10, marginRight: 10}}>
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
                                    borderBottomWidth: 2,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }} 
                                onPress={() => this.onSuggestionPress(ele)}>
                                    <Text style={{fontSize: 18}}>
                                        {this.fomatQuery(ele.query)}
                                    </Text>
                                    <Text>
                                        {ele[sourceIndexName].exact_nb_hits}
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

export default Home;