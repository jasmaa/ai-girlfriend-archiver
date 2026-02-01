module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  testEnvironment: "jsdom",
  collectCoverage: true,
  coverageReporters: ["json", "html"],
  setupFilesAfterEnv: ["./jest.setup.js"],
};
