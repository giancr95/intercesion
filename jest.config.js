module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(lucide-react-native|react-native-svg)/)",
  ],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
