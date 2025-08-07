const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000', // Your backend server URL
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api', // Rewrite the path if needed
      },
    })
  );
};
