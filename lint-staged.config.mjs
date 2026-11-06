export default {
  '*.{ts,tsx,js,mjs,cjs,css,json,md,html}': 'prettier --write --ignore-unknown',
  '*.{ts,tsx,js,mjs,cjs}': 'eslint --max-warnings=0',
};
