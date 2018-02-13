module.exports = {
    // Fit code within this line limit
    "printWidth": 79,

    // Specify the number of spaces per indentation-level.
    "tabWidth": 2,

    // If true, will use single instead of double quotes
    "singleQuote": true,

    // Controls the printing of trailing commas wherever possible.
    //
    // Valid options:
    //
    // "none" - No trailing commas
    // "es5"  - Trailing commas where valid in ES5 (objects, arrays, etc)
    // "all"  - Trailing commas wherever possible (function arguments)
    "trailingComma": "all",

    // Controls the printing of spaces inside array and objects
    "bracketSpacing": true,

    // If true, puts the `>` of a multi-line jsx element at the end of
    // the last line instead of being alone on the next line
    "jsxBracketSameLine": false,

    // Which parser to use. Valid options are "flow" and "babylon"
    "parser": "babylon",

    // Whether to add a semicolon at the end of every line (semi: true),
    // or only at the beginning of lines that may introduce ASI failures (semi: false)
    "semi": false
}
