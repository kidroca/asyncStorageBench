import {useAsyncCallback} from 'react-async-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  decorateWithMetrics,
  printMetrics,
  resetMetrics,
} from 'react-native-onyx/lib/decorateWithMetrics';
import {createRef, useEffect, useState} from 'react';

let dbCheckHelper = createRef({setHasItems: () => {}});

export const useResetAction = () =>
  useAsyncCallback(() => {
    AsyncStorage.clear();
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
  for (let i = 0; i < count; i++) {
    const item = Math.random().toFixed(2);
    await decoratedWrite(i.toString(), item);
  }

  await AsyncStorage.setItem('isFilled', 'filled');
  dbCheckHelper.current.setHasItems(true);
};

const readItemsSync = async count => {
  for (let i = 0; i < count; i++) {
    await decoratedRead(i.toString());
  }
};

const decoratedWrite = decorateWithMetrics(AsyncStorage.setItem, 'writeItem');
const decoratedWrites = decorateWithMetrics(writeItemsSync, 'writeItems');
const decoratedRead = decorateWithMetrics(AsyncStorage.getItem, 'readItem');
const decoratedReads = decorateWithMetrics(readItemsSync, 'readItems');

export const useWriteAction = (count = DEFAULT_COUNT) =>
  useAsyncCallback(async () => decoratedWrites(count), [count]);

export const useReadAction = (count = DEFAULT_COUNT) =>
  useAsyncCallback(async () => decoratedReads(count), [count]);

export const printInfo = () => {
  printMetrics();
  resetMetrics();
};

const DEFAULT_COUNT = 1 * 1000;
