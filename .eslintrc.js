module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/standard"],
  rules: {
    "no-console": "off",
    "no-debugger":  "off",
    "valid-typeof": "off",
    indent: ["error", 2],
    // allow paren-less arrow functions
    "arrow-parens": 0,
    "no-multi-spaces": 0,
    // allow async-await
    "generator-star-spacing": 0,
    // allow variables like >> user_id
    camelcase: 0,
    "no-trailing-spaces": ["error", { skipBlankLines: true }]
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
