
import open from 'react-dev-utils/openBrowser';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { webpackConfig, DEVELOPMENT_IP, DEVELOPMENT_PORT } from '../webpack.config';

/**
 *
 * @param webpackConfig
 * @param entry
 * @returns {function()}
 */
export const dev = (entry) => {
    const devServerOptions = {
        hot: true,
        historyApiFallback: true,
        stats: {
            assets: true,
            colors: true,
            cached: false,
            children: true,
            chunks: true,
            chunkModules: false,
            chunkOrigins: false,
            errors: true,
            errorDetails: true,
            hash: false,
            modules: false,
            publicPath: false,
            reasons: false,
            source: false,
            timing: true,
            version: false,
            warnings: true,
        },
    };
    let compiler = null;
    let server = null;
    try {
        compiler = webpack(webpackConfig);
        server = new WebpackDevServer(compiler, devServerOptions);
    } catch (ex) {
        console.log(ex);
    }

    let opened = false;

    const openBrowser = () => {
        const address = server.listeningApp.address();
        const url = `http://${address.address}:${address.port}`;
        console.log(`   server started: ${url}`);
        open(`${url}/${entry}.html`);
    };

    compiler.plugin('done', () => {
        if (!opened) {
            opened = true;
            openBrowser();
        }
    });

    const startServer = new Promise((resolve, reject) => {
        server.listen(DEVELOPMENT_PORT, DEVELOPMENT_IP, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    return async() => {
        await startServer;

        const stdIn = process.stdin;
        stdIn.setEncoding('utf8');
        stdIn.on('data', openBrowser);
    };
};

dev('html/index');
