// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for Metro bundler cache issue in SDK 54
config.resetCache = true;
config.cacheStores = [];

module.exports = config;
