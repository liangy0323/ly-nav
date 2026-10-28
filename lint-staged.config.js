export default {
  '**/*.{js,mjs,cjs,ts,vue}': [
    'eslint --fix --cache --cache-location node_modules/.cache/eslint/ --max-warnings 0 --no-warn-ignored',
    'prettier --write',
  ],
  '**/*.{json,md,yml,yaml,html,css,scss}': 'prettier --write',
};
