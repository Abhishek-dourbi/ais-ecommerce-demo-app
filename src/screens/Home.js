import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Button, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
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
        value: '',
        loading: false
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

    checkForValidSuggestion = (value) => {
        let valid = true;
        let {all, [this.state.selectedGender]: selectedGender, ...filters} = genders;
        Object.keys(filters).forEach(filter => {
            let regex = new RegExp("\\b" + filter + "\\b", "i");
            if(regex.test(value)) {
                valid = false;
            }
        })
        return valid;
    }

    getHits = (hit) => {
        console.log('hit', hit);
        let arr = [];
        let {all, [this.state.selectedGender]: selectedGender, ...filter} = genders;
        const { 
            query,
            [sourceIndexName]: { 
                facets: { 
                    exact_matches : {
                        brand_name,
                        "categories.level1": categories_level1,
                        "categories.level2": categories_level2,
                        "categories.level3": categories_level3
                    }
                } 
            }
        } = hit;
        if(hit.query.toUpperCase().includes(brand_name[0].value.toUpperCase())) {
            arr.push({
                query,
                filter: [
                    {
                        type: 'brand',
                        value: brand_name[0].value
                    }
                ]
            });
            categories_level1.forEach(ele => {
                if(this.checkForValidSuggestion(ele.value)) {
                    arr.push({
                        query: brand_name[0].value + " " + ele.value.replaceAll('/// ', ''),
                        filter: [
                            {
                                type: 'brand',
                                value: brand_name[0].value
                            },
                            {
                                type: 'category_level1',
                                value: ele.value
                            },
                        ]
                    })
                }
            });
            categories_level2.forEach(ele => {
                if(this.checkForValidSuggestion(ele.value)) {
                    arr.push({
                        query: brand_name[0].value + " " + ele.value.replaceAll('/// ', ''),
                        filter: [
                            {
                                type: 'brand',
                                value: brand_name[0].value
                            },
                            {
                                type: 'category_level2',
                                value: ele.value
                            },
                        ]
                    })
                }
            });
        } else {
            categories_level1.forEach(ele => {
                if(this.checkForValidSuggestion(ele.value)) {
                    arr.push({
                        query: ele.value.replaceAll('/// ', ''),
                        filter: [
                            {
                                type: 'category_level1',
                                value: ele.value
                            },
                        ]
                    })
                }
            })
            categories_level2.forEach(ele => {
                if(this.checkForValidSuggestion(ele.value)) {
                    arr.push({
                        query: ele.value.replaceAll('/// ', ''),
                        filter: [
                            {
                                type: 'category_level2',
                                value: ele.value
                            },
                        ]
                    })
                }
            })
            arr.push({
                query: brand_name[0].value + " " + query,
                filter: [
                    {
                        type: 'brand',
                        value: brand_name[0].value
                    },
                ]
            })
        }
        return arr;
    }

    onChangeText = async (value) => {
        this.setState({
            loading: true
        })
        const hits = await getSuggestions(this.state.selectedGender === 'all' ? value : `${genders[this.state.selectedGender].value} ${value}`);
        const newHits = this.getHits(hits[0]);
        this.setState({
            value,
            hits: [...newHits, ...hits.slice(1)] || [],
            loading: false
        }, () => console.log(this.state.hits))
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

    onSuggestionPress = ({query, filter, ...rest}) => {
        let params = {
            q: query,
        };

        if(filter) {
            filter.forEach(({type, value}) => {
                if(type === "brand") {
                    params = { ...params, brand_name: value }
                } else if(type === "category_level1") {
                    params = { ...params, ["categories.level1"]: value }
                } else if(type === "category_level2") {
                    params = { ...params, ["categories.level2"]: value }
                }
            })
        }
        if(this.state.selectedGender !== "all") {
            params = { ...params, ["categories.level0"]: this.state.selectedGender }
        }
        this.props.navigation.navigate('PLP', {
            params,
            title: query
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevState.selectedGender !== this.state.selectedGender && (this.state.value || this.state.hits.length)) {
            this.onChangeText(this.state.value);
        }
    }

    fomatQuery = (query) => {
        if(this.state.selectedGender === "all") return query;
        let regex = new RegExp("\\b" + this.state.selectedGender + "\\b", "i");
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
                            this.state.loading ? <ActivityIndicator color="white" size="large" style={{margin: 10}} /> :
                            <>
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
                                    this.state.hits.slice(0, 5).map(ele => {
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
                                                    {ele[sourceIndexName]?.exact_nb_hits || 0}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </>
                        }
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

export default Home;