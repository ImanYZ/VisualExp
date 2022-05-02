module.exports = {
  async rewrites() {
    return [
      {
        source: "/knowledge",
        destination: "/",
      },
    ];
  },
};
