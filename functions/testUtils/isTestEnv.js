const isTestEnv = () => {
  return process.env.NODE_ENV === "test"
}

module.exports = isTestEnv;