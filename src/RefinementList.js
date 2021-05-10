import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connectRefinementList } from 'react-instantsearch-native';

const styles = StyleSheet.create({
  // fill with styles on the next step
});

const RefinementList = ({ items, refine }) => (
  <View style={styles.container}>
    <View style={styles.title}>
      <Text style={styles.titleText}>Brand</Text>
    </View>
    <View style={styles.list}>
      {items.map(item => {
        const labelStyle = {
          fontSize: 16,
          fontWeight: item.isRefined ? '800' : '400',
        };

        return (
          <TouchableOpacity
            key={item.value}
            onPress={() => refine(item.value)}
            style={styles.item}
          >
            <Text style={labelStyle}>{item.label}</Text>
            <View style={styles.itemCount}>
              <Text style={styles.itemCountText}>{item.count}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const ItemPropType = PropTypes.shape({
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.string.isRequired,
  isRefined: PropTypes.bool.isRequired,
});

RefinementList.propTypes = {
  items: PropTypes.arrayOf(ItemPropType).isRequired,
  refine: PropTypes.func.isRequired,
};

export default connectRefinementList(RefinementList);
