import fs from 'fs';
import URL from 'url';
import path from 'path';
import { Readable } from 'stream';

import { http, https } from 'follow-redirects';

class Cache {
    constructor(path) {
        if (typeof path === 'string') {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            } else if (!fs.statSync(path).isDirectory) {
                throw new Error(`[Cache] '${path} was token by unknown file. Please remove it manually.'`);
            }
            this.path = path;
        } else {
            throw new Error('Cache path unvalid');
        }
        this.headers = {};
    }

    fullPath(fileName) {
        return path.join(this.path, String(fileName));
    }

    writeStream(fileName) {
        return fs.createWriteStream(this.fullPath(fileName));
    }

    fetch(url) {
        const opt = URL.parse(url);
        let request;
        switch (opt.protocol) {
            case 'http:':
                request = http;
                break;
            case 'https:':
                request = https;
                break;
            default:
                throw new Error(`Unsupported protocol ${opt.protocol}.`);
        }
        return new Promise(resolve => {
            request.get({
                host: opt.host,
                path: opt.path,
                headers: this.headers
            }, resolve);
        });
    }

    fetchAsFile(url, outputFileName) {
        return new Promise((resolve, reject) => {
            fetch(url).then(res => {
                if (res.statusCode === 200) {
                    res.pipe(this.writeStream(outputFileName));
                    resolve(this.fullPath(outputFileName));
                } else {
                    reject(res.statusCode);
                }
            });
        });
    }        

    save(outputFileName, data) {
        return new Promise((resolve, reject) => {
            if (data instanceof Readable) {
                data.pipe(this.writeStream(outputFileName));
                resolve(this.fullPath(outputFileName));
            } else {
                if (typeof data === 'object') {
                    data = JSON.stringify(data);
                }
                fs.writeFile(this.fullPath(outputFileName), data, err => {
                    if (err) reject(err);
                    resolve(this.fullPath(outputFileName));
                });
            }
        });
    }

    has(fileName) {
        return new Promise(resolve => {
            fs.exists(this.fullPath(fileName), resolve);
        });
    }

    rm(fileName) {
        return new Promise((resolve, reject) => {
            fs.unlink(this.fullPath(fileName), err => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}

export default Cache;
