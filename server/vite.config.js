// Minimal vite config for Railway production build
export default {
  plugins: [],
  resolve: { alias: {} },
  root: ".",
  build: { outDir: "dist", emptyOutDir: true },
  server: { fs: { strict: true, deny: ["**/.*"] } }
};
