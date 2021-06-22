import React from "react";
import {View, Text, FlatList, Image} from 'react-native';
import { algoliaSDK } from "../Algolia";

export default class PLP extends React.Component {
    state = {
        data: []
    }

    async componentDidMount() {
        const params = this.props.route.params.params
        
        this.props.navigation.setParams({ name: this.props.route.params.title })

        try {
            const res = await algoliaSDK.getPLP(params);
            this.setState({
                data: res.data
            });
            console.log(res);
        } catch(e) {
            console.log(e);
        }
    }

    renderItem = ({item}) => {
        return (
            <View style={{width: '50%', alignSelf: 'center'}}>
                <Image source={{uri: item.thumbnail_url}} style={{width: '100%', height: 200}} />
                <Text style={{flexWrap: 'wrap'}}>
                    {item.brand_name}
                </Text>
            </View>
        )
    }

    render() {
        return (
            <View style={{flex: 1, paddingHorizontal: 10}}>
                <FlatList 
                    data={this.state.data}
                    renderItem={this.renderItem}
                    contentContainerStyle={{justifyContent: 'space-between'}}
                    numColumns={2}
                />
            </View>
        )
    }
}