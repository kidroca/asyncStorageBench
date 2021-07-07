/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import type {Node} from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  useHasDbItems,
  useMetrics,
  useReadAction,
  useResetAction,
  useWriteAction,
} from './bench/hooks';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [count, setCount] = useState(10000);

  const reset = useResetAction();
  const write = useWriteAction(count);
  const read = useReadAction(count);
  const hasDbItems = useHasDbItems();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const isLoading = reset.loading || write.loading || read.loading;
  const stats = useMetrics(isLoading);

  return (
    <SafeAreaView style={[styles.screen, backgroundStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Section title="DB State">
          {hasDbItems ? 'Has Content' : 'Empty DB'}
        </Section>
        <View style={[styles.sectionContainer]}>
          <AppText style={styles.sectionTitle}>
            Actions
            <ActivityIndicator
              color={Colors.primary}
              style={styles.loader}
              animating={isLoading}
              size="small"
            />
          </AppText>

          <View style={styles.row}>
            <Text style={styles.input}>Items count: </Text>
            <TextInput
              keyboardType="numeric"
              defaultValue="10000"
              style={[
                styles.input,
                {backgroundColor: isDarkMode ? Colors.dark : Colors.light},
              ]}
              onChangeText={text => setCount(Number.parseInt(text, 10))}
              maxLength={7}
              autoCompleteType="off"
              textAlign="center"
              editable={!isLoading}
            />
          </View>

          <Action title="Reset" action={reset} disabled={isLoading} />
          <Action title="Write" action={write} disabled={isLoading} />
          <Action title="Read" action={read} disabled={isLoading} />
        </View>
        {Object.keys(stats)
          .filter(stat => stats[stat].avg > 0)
          .map(stat => (
            <StatsSection key={stat} title={stat} {...stats[stat]} />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({children, title}): Node => (
  <View style={styles.sectionContainer}>
    <AppText style={styles.sectionTitle}>{title}</AppText>
    <AppText style={styles.sectionDescription}>{children}</AppText>
  </View>
);

const StatsSection = ({title, total, max, min, avg, calls}): Node => (
  <Section title={title}>
    Total: <HumanReadableDuration millis={total} />
    {'\n'}
    Max: <HumanReadableDuration millis={max} />
    {'\n'}
    Min: <HumanReadableDuration millis={min} />
    {'\n'}
    Average: <HumanReadableDuration millis={avg} />
    {'\n'}
    Ops: {calls?.length ?? 0}
  </Section>
);

const HumanReadableDuration = ({millis = 0}): Node => {
  const second = 1000;
  if (millis > second) {
    return `${(millis / second).toFixed(2)}sec`;
  }

  return `${millis.toFixed(3)}ms`;
};

const Action = ({action, title, disabled}): Node => (
  <View style={styles.actionWrap}>
    <Button
      title={title}
      onPress={action.execute}
      disabled={disabled}
      color={Colors.primary}
    />
  </View>
);

const AppText = ({style, ...props}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  const color = isDarkMode ? Colors.white : Colors.black;

  return <Text style={[{color}, style]} {...props} />;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 8,
    paddingHorizontal: 24,
    position: 'relative',
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
  loader: {
    height: 18,
    paddingLeft: 8,
    alignSelf: 'center',
  },
  actionWrap: {
    marginBottom: 8,
  },
  input: {
    fontSize: 18,
    fontWeight: '400',
    flex: 1,
  },
  tint: {
    backgroundColor: '#aaa',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
});

export default App;
