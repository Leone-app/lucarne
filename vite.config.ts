import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src/admin',
  build: {
    outDir: '../../public',
    emptyOutDir: false,
  },
  plugins: [react()],
});
