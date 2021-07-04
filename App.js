/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  printInfo,
  useHasDbItems,
  useMetrics,
  useReadAction,
  useResetAction,
  useWriteAction,
} from './bench/hooks';

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const reset = useResetAction();
  const write = useWriteAction();
  const read = useReadAction();
  const hasDbItems = useHasDbItems();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const isLoading = reset.loading || write.loading || read.loading;
  const {writeItem = {}, readItem = {}} = useMetrics(isLoading);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="DB State">
            {hasDbItems ? 'Has Content' : 'Empty DB'}
          </Section>
          <Section title="Actions" />
          <Button title="Reset" onPress={reset.execute} />
          <Button title="Write" onPress={write.execute} disabled={isLoading} />
          <Button title="Read" onPress={read.execute} disabled={isLoading} />
          <Button title="Print Info" onPress={printInfo} disabled={isLoading} />
          <ActivityIndicator animating={isLoading} size="large" />
          <Section title="Write Stats">
            Total: <HumanReadableDuration millis={writeItem.total} />
            {'\n'}
            Max: <HumanReadableDuration millis={writeItem.max} />
            {'\n'}
            Min: <HumanReadableDuration millis={writeItem.min} />
            {'\n'}
            Average: <HumanReadableDuration millis={writeItem.avg} />
            {'\n'}
            Write Ops: {writeItem.calls?.length ?? 0}
          </Section>
          <Section title="Read Stats">
            Total: <HumanReadableDuration millis={readItem.total} />
            {'\n'}
            Max: <HumanReadableDuration millis={readItem.max} />
            {'\n'}
            Min: <HumanReadableDuration millis={readItem.min} />
            {'\n'}
            Average: <HumanReadableDuration millis={readItem.avg} />
            {'\n'}
            Read Ops: {readItem.calls?.length ?? 0}
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const HumanReadableDuration: () => Node = ({millis = 0}) => {
  const minute = 60 * 1000;
  if (millis > minute) {
    return `${(millis / minute).toFixed(1)}min`;
  }

  const second = 1000;
  if (millis > second) {
    return `${(millis / second).toFixed(2)}sec`;
  }

  return `${millis.toFixed(3)}ms`;
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
