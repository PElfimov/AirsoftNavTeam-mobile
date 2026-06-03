import Reactotron, {networking} from 'reactotron-react-native';

// @ts-ignore
Reactotron.configure({}).use(networking()).useReactNative().connect();
