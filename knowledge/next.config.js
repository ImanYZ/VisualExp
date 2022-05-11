module.exports = {
  async rewrite() {
    return [
      {
        source: "/knowledge",
        destination: "/",
      },
    ];
  },
  async headers() {
    return [
      {
        // This works, and returns appropriate Response headers:
        source: "/knowledge",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "-1",
          },
          {
            key: "Cache-Control",
            value: "no-cache",
          },
        ],
      },
    ];
  },
};
