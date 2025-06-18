export default {
  plugins: [],
  resolve: {
    alias: {
      "@": "/client/src",
      "@shared": "/shared", 
      "@assets": "/attached_assets",
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
  },
  define: {
    global: "globalThis",
  },
};
