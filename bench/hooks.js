import {useAsyncCallback} from 'react-async-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    const item = mockData[random(0, mockData.length - 1)].message;
    await decoratedWrite(key.toString(), item);
  }

  await AsyncStorage.setItem('isFilled', 'filled');
  dbCheckHelper.current.setHasItems(true);
};

const readItemsSync = async count => {
  const numbers = getShuffledNumbers(count);

  for (let i = 0; i < count; i++) {
    const key = `${KEY_PREFIX}${numbers[i]}`;
    await decoratedRead(key);
  }
};

const getShuffledNumbers = count => shuffle(range(1, count));

const decoratedWrite = decorateWithMetrics(AsyncStorage.setItem, 'writeItem');
const decoratedWrites = decorateWithMetrics(writeItemsSync, 'writeItems');
const decoratedRead = decorateWithMetrics(AsyncStorage.getItem, 'readItem');
const decoratedReads = decorateWithMetrics(readItemsSync, 'readItems');

export const useWriteAction = (count = DEFAULT_COUNT) =>
  useAsyncCallback(async () => decoratedWrites(count), [count]);

export const useReadAction = (count = DEFAULT_COUNT) =>
  useAsyncCallback(async () => decoratedReads(count), [count]);

export const useMetrics = deps => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const met = getMetrics();
    console.log('met: ', met);
    setMetrics(getMetrics().summaries);
  }, [deps]);

  return metrics;
};

export const printInfo = () => {
  printMetrics();
  resetMetrics();
};

const DEFAULT_COUNT = 1 * 1000;
const KEY_PREFIX = 'rnd-key-';
