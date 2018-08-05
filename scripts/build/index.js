
import webpack from 'webpack';
import { webpackConfig } from '../webpack.config';

webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
        console.error(err || stats.compilation.errors);
    } else {
        const {
            startTime,
            endTime,
        } = stats;
        const buildTime = endTime - startTime;
        console.log(`buildTime ${buildTime}ms`);
    }
});
