const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const cwd = process.cwd();

const extractCss = new ExtractTextPlugin({
    filename: 'stylesheets/[name].css',
    allChunks: true,
});

const jsRule = {
    test: /\.js$/,
    use: [{
        loader: 'babel-loader',
        options: {
            cacheDirectory: true,
            presets: [
                ['env', {
                    targets: {
                        node: 6,
                        // browsers: ['last 2 versions', 'ie >= 9'],
                    },
                    modules: false,
                }],
                'react',
            ],
            plugins: [
                'transform-object-rest-spread',
                'transform-class-properties',
                'transform-class-constructor-call',
                'transform-function-bind',
                'transform-export-extensions',
            ],
        },
    }],
};

const cssRule = {
    test: /\.css$/,
    use: extractCss.extract({
        fallback: 'style-loader',
        use: [
            {
                loader: 'css-loader',
                options: {
                    minimize: true,
                },
            },
        ],
    }),
};

const fileRule = {
    test: /\.(png|jpg|gif)$/,
    use: [
        {
            loader: 'url-loader',
            options: {
                limit: 8192,
                name: 'images/[name].[ext]',
            },
        },
    ],
};

const moduleRules = [
    jsRule,
    cssRule,
    fileRule,
];

module.exports = {
    // The configuration for the server-side rendering
    name: 'index server-side rendering',
    entry: {
        page: [path.join(cwd, 'scripts/ssr/page.js')],
    },
    target: 'node',
    output: {
        path: path.join(cwd, 'release'),
        filename: '[name].generated.js',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: moduleRules,
    },
    plugins: [
        extractCss,
        new webpack.NamedModulesPlugin(),
    ],
    resolve: {
        modules: [
            'node_modules',
        ],
        extensions: ['.web.js', '.js', '.json'],
    },
};
