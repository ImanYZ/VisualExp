module.exports = {
  async redirects() {
    return [
      {
        source: "/knowledge*",
        destination: "/*",
      },
    ];
  },
};
