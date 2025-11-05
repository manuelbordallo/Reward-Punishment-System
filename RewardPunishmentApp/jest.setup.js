// Mock __DEV__ global variable
global.__DEV__ = true;

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children, screenOptions }) => {
        // Render tab bar with screen titles
        const screens = React.Children.toArray(children);
        return React.createElement('View', {}, [
          // Render tab bar
          React.createElement('View', { key: 'tabbar' },
            screens.map((screen, index) =>
              React.createElement('Text', {
                key: `tab-${index}`,
                onPress: () => { }
              }, screen.props.options?.title || screen.props.name)
            )
          ),
          // Render first screen by default
          screens[0]
        ]);
      },
      Screen: ({ children, component: Component, options }) => {
        return Component ? React.createElement(Component) : children;
      },
    }),
  };
});

// Mock React Native components and modules
jest.mock('react-native', () => {
  const mockComponent = (name) => {
    const React = require('react');
    return React.forwardRef((props, ref) => {
      return React.createElement(name, { ...props, ref });
    });
  };

  return {
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TextInput: mockComponent('TextInput'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    FlatList: mockComponent('FlatList'),
    SafeAreaView: mockComponent('SafeAreaView'),
    ScrollView: mockComponent('ScrollView'),
    StyleSheet: {
      create: (styles) => styles,
      flatten: (styles) => styles,
    },
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
  };
});

// Mock TurboModuleRegistry
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(() => ({})),
  get: jest.fn(() => ({})),
}));

// Mock ConnectionTest component to avoid network calls in tests
jest.mock('./src/components/ConnectionTest', () => {
  const React = require('react');
  return {
    ConnectionTest: () => {
      return React.createElement('View', {},
        React.createElement('Text', {}, 'Connection Test (Mocked)')
      );
    },
  };
});