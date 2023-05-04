import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { PanGestureHandler } from 'react-native-gesture-handler';

import colors from '../constants/colors';
import { translate } from '../i18n/locale';

const gap = 2;
const iosTabVerticalSpacing = gap;
const tabControlStyles = StyleSheet.create({
  tabsContainerStyle: {
    paddingTop: gap,
    paddingBottom: gap,
  },
  tabStyle: {
    flex: 1,
    marginVertical: iosTabVerticalSpacing,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tabTextStyle: {
    color: colors.brandDarkLight,
    fontFamily: 'Montserrat_Bold',
    paddingVertical: 2 * gap,
    paddingHorizontal: 2 * gap,
    alignSelf: 'center',
  },
  activeTabStyle: {
    backgroundColor: colors.brandPrimary,
  },
  activeTabTextStyle: {
    color: colors.brandDarkLight,
  },
  firstTabStyle: { marginLeft: 0 },
  lastTabStyle: { marginRight: 0 },
});
const wrapperStyles = StyleSheet.create({
  outerGapStyle: {
    padding: 2,
    backgroundColor: colors.warmGray100,
    borderWidth: 0.5,
    borderColor: colors.warmGray200,
  },
});

const Container = ({
  children,
  numberValues,
  style,
  activeTabIndex,
  onIndexChange,
}) => {
  const { tabStyle, activeTabStyle, tabsContainerStyle } = style;
  const margin = 5;
  const [moveAnimation] = useState(new Animated.Value(0));
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const leftVal = (containerWidth / numberValues) * activeTabIndex;
    Animated.timing(moveAnimation, {
      toValue: leftVal,
      duration: 150,
      // not supported by native animated module
      useNativeDriver: false,
    }).start();
  }, [containerWidth, activeTabIndex]);

  const onGestureEvent = (evt) => {
    const tabWidth = containerWidth / numberValues;
    let index = Math.floor(evt.nativeEvent.x / tabWidth);
    if (index > numberValues - 1) index = numberValues - 1;
    else if (index < 0) index = 0;
    if (index !== activeTabIndex) {
      onIndexChange(index);
    }
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <View
        style={[
          {
            marginHorizontal: margin,
            flexDirection: 'row',
            position: 'relative',
          },
          tabsContainerStyle,
        ]}
        onLayout={(event) => {
          setContainerWidth(event.nativeEvent.layout.width);
        }}
      >
        <Animated.View
          style={{
            width: containerWidth / numberValues,
            left: moveAnimation,
            top: iosTabVerticalSpacing,
            bottom: iosTabVerticalSpacing,
            position: 'absolute',
            ...tabStyle,
            ...activeTabStyle,
          }}
        />
        {children}
      </View>
    </PanGestureHandler>
  );
};

const shouldRenderLeftSeparator = (index, selectedIndex) => {
  const isFirst = index === 0;
  const isSelected = index === selectedIndex;
  const isPrevSelected = index - 1 === selectedIndex;
  return !(isFirst || isSelected || isPrevSelected);
};

const IosTab = ({
  children,
  style: tabControlStyle,
  onPress,
  renderLeftSeparator,
}) => (
  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
    {renderLeftSeparator && (
    <View
      style={{
        height: '50%',
        width: 2,
        borderRadius: 5,
        backgroundColor: colors.brandDarkLight,
      }}
    />
    )}
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={tabControlStyle}>{children}</View>
    </TouchableWithoutFeedback>
  </View>
);

const Tab = ({
  label,
  onPress,
  isActive,
  isFirst,
  isLast,
  renderLeftSeparator,
}) => {
  const {
    tabStyle,
    tabTextStyle,
    activeTabTextStyle,
    firstTabStyle,
    lastTabStyle,
  } = tabControlStyles;
  return (
    <IosTab
      onPress={onPress}
      style={[
        tabStyle,
        isFirst && firstTabStyle,
        isLast && lastTabStyle,
      ]}
      renderLeftSeparator={renderLeftSeparator}
    >
      <Text style={[tabTextStyle, isActive && activeTabTextStyle]}>
        {translate(label)}
      </Text>
    </IosTab>
  );
};

const SegmentedControl = ({
  values: tabValues,
  selectedIndex,
  onIndexChange,
  renderSeparators,
}) => (
  <Container
    style={tabControlStyles}
    numberValues={tabValues.length}
    activeTabIndex={selectedIndex}
    onIndexChange={onIndexChange}
  >
    {tabValues.map((tabValue, index) => (
      <Tab
        label={tabValue}
        onPress={async () => {
          onIndexChange(index);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        isActive={selectedIndex === index}
        isFirst={index === 0}
        isLast={index === tabValues.length - 1}
        renderLeftSeparator={
            renderSeparators && shouldRenderLeftSeparator(index, selectedIndex)
          }
        key={tabValue}
      />
    ))}
  </Container>
);

const TabControl = ({ values, onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleIndexChange = (index) => {
    setSelectedIndex(index);
    onChange(values[index]);
  };

  return (
    <View style={wrapperStyles.outerGapStyle}>
      <SegmentedControl
        values={values}
        selectedIndex={selectedIndex}
        onIndexChange={handleIndexChange}
        renderSeparators
      />
    </View>
  );
};

export default TabControl;