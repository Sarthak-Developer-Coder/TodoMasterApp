/**
 * index.js - Entry point for the React Native application
 * Registers the main App component with the AppRegistry
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
