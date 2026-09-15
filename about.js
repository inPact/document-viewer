const _ = require('lodash');
const readline = require('readline');
const fs = require('fs');
const util = require('util');
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const getFeatures = util.promisify(_getFeatures);

getAbout().then((about) => fs.writeFileSync('./dist/version.json', JSON.stringify(about)));

async function getAbout() {
    try {
        let [stats, data] = [await stat('./package.json'), await readFile('./package.json', 'utf8')];
        let pkgData = JSON.parse(data);
        let proc = {
            platform: process.platform,
            version: process.version,
            release: process.release,
        };
        let result = {
            name: pkgData.name,
            version: pkgData.version,
            timestamp: stats.mtime,
            config: process.env.NODE_ENV || 'local',
            process: proc,
            engines: pkgData.engines || {},
            content: {},
        };
        if (result.config !== 'production') {
            result.content.features = await getFeatures(result.version);
        }
        return result;
    } catch (ex) {}
}

const headerLineRegex = /(#{1,3}\s)(.*)/;
const issueLineRegex = /(\*\s+)(\[@?TAB-\d{3,}]\s)?(.*)/;

function _getFeatures(version, next) {
    try {
        let features = [];

        const rl = readline.createInterface({
            input: fs.createReadStream('./release_notes.md'),
            crlfDelay: Infinity,
        });

        let readingFeatures = false;
        let featureVersion;

        rl.on('line', (line) => {
            let headerParts = line.match(headerLineRegex);
            if (readingFeatures) {
                let parts = line.match(issueLineRegex);
                if (parts && parts.length > 2) {
                    features.push({
                        issue: _.trim(parts[parts.length - 2]),
                        description: _.trim(parts[parts.length - 1]),
                        version: featureVersion,
                    });
                }
            }
            if (headerParts && headerParts.length) {
                featureVersion = headerParts[2] || '';
                readingFeatures = _.startsWith(featureVersion, 'NEXT') || featureVersion.indexOf(version) >= 0;
            }
        });

        rl.on('close', () => {
            next(null, features);
        });
    } catch (ex) {
        next(ex);
    }
}
