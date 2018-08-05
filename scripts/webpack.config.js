const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');
const numeral = require('numeral');
const logUpdate = require('log-update');
const os = require('os');
const path = require('path');
const glob = require('glob');
const ip = require('ip');

export const DEVELOPMENT_IP = ip.address();
export const DEVELOPMENT_PORT = Math.floor(Math.random() * 65536);

const cwd = process.cwd();

let NODE_ENV = process.env.NODE_ENV;
if (NODE_ENV === 'product') {
    NODE_ENV = 'production';
}

const COMMON_CHUNK_NAME = 'common';
const WEBPACK_BOOTSTRAP = 'bootstrap';
const SOURCE_PATH = path.join(cwd, 'src');
const ENTRIES_PATH = path.join(cwd, 'src', 'entries');
const TEMPLATE_PATH = path.join(cwd, 'src', 'templates');
const OUTPUT_PATH = path.join(cwd, 'release');
const CORTEX_MODULE_PATH = path.join(cwd, 'cortex_modules');

const extractCss = new ExtractTextPlugin({
    filename: 'css/[name].reset.css',
    allChunks: true,
});

const addHtmlWebpackPlugins = ({
                                   plugins,
                                   entryName,
                                   templatePath,
                                   fileName,
                               }) => {
    if (entryName === COMMON_CHUNK_NAME) {
        return;
    }

    plugins.push(new HtmlWebpackPlugin({
        template: templatePath,
        filename: fileName,
        inject: 'body',
        hash: false,
        chunksSortMode: 'manual',
        chunks: [
            WEBPACK_BOOTSTRAP,
            // COMMON_CHUNK_NAME,
            entryName,
        ],
        minify: {
            collapseWhitespace: false,
        },
    }));
};

const addEntryDevOptions = (entry) => {
    entry.unshift(`webpack-dev-server/client?http://${DEVELOPMENT_IP}:${DEVELOPMENT_PORT}`);
    entry.unshift('webpack/hot/log-apply-result');

    // hot reload
    // entry.unshift('webpack/hot/dev-server');
    entry.unshift('webpack/hot/only-dev-server');
    entry.unshift('react-hot-loader/patch');
};

const jsRule = {
    test: /\.js$/,
    include: [
        SOURCE_PATH,
    ],
    use: [{
        loader: 'babel-loader',
        options: {
            cacheDirectory: true,
            presets: [
                ['env', {
                    targets: {
                        browsers: ['last 2 versions', 'ie >= 9'],
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
                'transform-runtime',
            ]
        },
    }],
};

const cssRule = {
    test: /\.css$/,
    use: [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                minimize: true,
            },
        },
    ],
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

let moduleRules = [];

if (NODE_ENV !== 'development') {
    moduleRules.push(jsRule);
} else {
    moduleRules.push(
        jsRule,
        cssRule,
        // fileRule,           // happypack does not support url-loader/file-loader
    );
}

const happPackVerbose = NODE_ENV === 'development';
const happyPackPlugins = [];
moduleRules = moduleRules.map((moduleRule, index) => {
    const id = String(index);
    const happPackPlugin = new HappyPack({
        id,
        loaders: [...moduleRule.use],
        threads: 4,
        verbose: happPackVerbose,
    });
    happyPackPlugins.push(happPackPlugin);
    const newModuleRule = {
        ...moduleRule,
        use: [
            `happypack/loader?id=${id}`,
        ],
    };
    return newModuleRule;
});
moduleRules.push(fileRule);

export const webpackConfig = {
    entry: {},
    output: {
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].[chunkHash].js',     // to support the new feature 'import()' for webpack 3
        crossOriginLoading: 'anonymous',
    },
    module: {
        rules: moduleRules,
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: COMMON_CHUNK_NAME,
            filename: 'js/[name].js',
            minChunks: Infinity,
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: WEBPACK_BOOTSTRAP,
            filename: 'js/[name].js',
            chunks: [COMMON_CHUNK_NAME],
        }),
        new ScriptExtHtmlWebpackPlugin({
            custom: {
                test: /\.js$/,
                attribute: 'crossorigin',
                value: 'anonymous',
            },
        }),
        ...happyPackPlugins,
        new webpack.optimize.ModuleConcatenationPlugin(),   // for webpack3
    ],
    watchOptions: {
        ignored: [
            /node_modules/,
        ],
    },
};

webpackConfig.output.path = OUTPUT_PATH;
webpackConfig.output.publicPath = '../';

webpackConfig.resolve = {
    modules: [
        'node_modules',
        'cortex_modules',
    ],
    extensions: ['.web.js', '.js', '.json'],
};

if (NODE_ENV !== 'development') {
    const extractCssRule = {
        test: /\.css/,
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
    webpackConfig.module.rules.push(
        extractCssRule,
    );
    webpackConfig.plugins.push(
        extractCss,
    );
}

// get entry
const entryFileNameList = glob.sync(`${ENTRIES_PATH}/*.js`);
const entryNameList = entryFileNameList.map((entryFileName) => {
    return path.basename(entryFileName, '.js');
});

// get corresponding html template
const htmlFileNameList = glob.sync(`${TEMPLATE_PATH}/**/*.html`);
const htmlNameList = htmlFileNameList.map((htmlFileName) => {
    return path.basename(htmlFileName, '.html');
});

// set entry
entryNameList.forEach((entryName) => {
    webpackConfig.entry[entryName] = [
        path.join(`${ENTRIES_PATH}/${entryName}.js`),
    ];

    let template = '';
    let filename = '';
    let htmlTemplateName = 'index';
    const htmlNameIndex = htmlNameList.indexOf(entryName);
    if (htmlNameIndex !== -1) {
        htmlTemplateName = entryName;
        template = htmlFileNameList[htmlNameIndex];
        filename = `html${template.replace(`${TEMPLATE_PATH}`, '')}`;
    } else {
        template = `${TEMPLATE_PATH}/${htmlTemplateName}.html`;
        filename = `html/${entryName}.html`;
    }

    addHtmlWebpackPlugins({
        plugins: webpackConfig.plugins,
        entryName,
        templatePath: template,
        fileName: filename,
    });
});

switch (NODE_ENV) {
    case 'development':
        entryNameList.forEach((entryName) => {
            const entry = webpackConfig.entry[entryName];
            addEntryDevOptions(entry);
        });
        webpackConfig.devtool = 'eval';
        webpackConfig.output.publicPath = '/';
        webpackConfig.plugins.push(
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.ProgressPlugin((percentage, msg) => {
                logUpdate('     progress:', numeral(percentage).format('00.00%'), msg);
            }),
        );
        webpackConfig.devServer = {
            historyApiFallback: true,
            hot: true,
            inline: true,
            stats: 'normal',
            disableHostCheck: true,
        };
        break;
    default:
        webpackConfig.plugins.push(
            new CleanPlugin([OUTPUT_PATH], { root: cwd }),
            new CleanPlugin([CORTEX_MODULE_PATH], { root: cwd }),
            // replace moduleid with unique hash, to avoid common chunk file unnecessary changes when uncommon chunk module is added
            new webpack.HashedModuleIdsPlugin(),
            // new UglifyJSPlugin(),
        );

        webpackConfig.devtool = 'source-map';
        webpackConfig.output.publicPath = '../';
        break;
};

