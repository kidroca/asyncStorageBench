import {useAsyncCallback} from 'react-async-hook';
import AsyncStorage from '@react-native-community/async-storage';
import {
  decorateWithMetrics,
  printMetrics,
  getMetrics,
  resetMetrics,
} from 'react-native-onyx/lib/decorateWithMetrics';
import {createRef, useEffect, useState} from 'react';
import {random, range, shuffle} from 'lodash';

import mockData from './mock-data.json';

let dbCheckHelper = createRef({setHasItems: () => {}});

export const useResetAction = () =>
  useAsyncCallback(async () => {
    await AsyncStorage.clear();
    resetMetrics();
    dbCheckHelper.current.setHasItems(false);
  }, []);

export const useHasDbItems = () => {
  const [hasItems, setHasItems] = useState(false);
  useEffect(() => {
    dbCheckHelper.current = {setHasItems};
    AsyncStorage.getItem('isFilled').then(item => {
      setHasItems(Boolean(item));
    });
  }, []);

  return hasItems;
};

const writeItemsSync = async count => {
  const numbers = getShuffledNumbers(count);

  for (let i = 0; i < count; i++) {
    const key = `${KEY_PREFIX}${numbers[i]}`;
    const value = getPayload();

    if (__DEV__ && count <= 1000) {
      console.info('writing key: ', key);
      console.log('writing value: ', value);
    }

    await decoratedWrite(key.toString(), value);
  }

  await AsyncStorage.setItem('isFilled', 'filled');
  dbCheckHelper.current.setHasItems(true);
};

const writeItemsBatch = async count => {
  const numbers = getShuffledNumbers(count);
  const pairs = numbers.map(n => {
    const key = `${KEY_PREFIX}${n}`;
    const value = getPayload();

    return [key, value];
  });

  await decoratedMultiSet(pairs);
  await AsyncStorage.setItem('isFilled', 'filled');
  dbCheckHelper.current.setHasItems(true);
};

const writeItemsParallel = async count => {
  const tasks = getShuffledNumbers(count).map(n => {
    const key = `${KEY_PREFIX}${n}`;
    const value = getPayload();

    return decoratedWrite(key, value);
  });

  await Promise.all(tasks);
  await AsyncStorage.setItem('isFilled', 'filled');
  dbCheckHelper.current.setHasItems(true);
};

const readItemsSync = async count => {
  const numbers = getShuffledNumbers(count);

  for (let i = 0; i < count; i++) {
    const key = `${KEY_PREFIX}${numbers[i]}`;
    const value = await decoratedRead(key);

    if (__DEV__ && count <= 1000) {
      console.info('read key: ', key);
      console.log('read value: ', value);
    }
  }
};

const readItemsBatch = async count => {
  const keys = getShuffledNumbers(count).map(n => `${KEY_PREFIX}${n}`);
  return decoratedMultiGet.call(AsyncStorage, keys);
};

const readItemsParallel = async count => {
  const tasks = getShuffledNumbers(count).map(n => {
    const key = `${KEY_PREFIX}${n}`;
    return decoratedRead(key);
  });

  return Promise.all(tasks);
};

const getShuffledNumbers = count => shuffle(range(1, count + 1));

const getPayload = () => mockData[random(0, mockData.length - 1)].message;

const decoratedWrite = decorateWithMetrics(AsyncStorage.setItem, 'writeItem');
const decoratedRead = decorateWithMetrics(AsyncStorage.getItem, 'readItem');

const decoratedMultiSet = decorateWithMetrics(
  AsyncStorage.multiSet,
  'multiSet',
);
const decoratedMultiGet = decorateWithMetrics(
  AsyncStorage.multiGet,
  'multiGet',
);
const decoratedParallelWrite = decorateWithMetrics(
  writeItemsParallel,
  'writeItemsParallel',
);

const decoratedParallelRead = decorateWithMetrics(
  readItemsParallel,
  'readItemsParallel',
);

export const useWriteAction = (count = DEFAULT_COUNT) =>
  useAsyncCallback(async () => writeItemsBatch(count), [count]);

export const useReadAction = (count = DEFAULT_COUNT) =>
  useAsyncCallback(async () => readItemsBatch(count), [count]);

export const useMetrics = deps => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    setMetrics(getMetrics().summaries);
  }, [deps]);

  return metrics;
};

global.printMetrics = printMetrics;

const DEFAULT_COUNT = 10 * 1000;
const KEY_PREFIX = 'rnd-key-';
