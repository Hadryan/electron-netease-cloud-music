import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const pkgJSON = require('../../package.json');
const configName = 'settings.json';
const configDir = path.join(app.getPath('appData'), pkgJSON.name);
const configPath = path.join(configDir, configName);

export const appName = process.env.NODE_ENV === 'development'
    ? 'Electron'
    : pkgJSON.name;

export const appVer = pkgJSON.version;

export const defaultSettings = {
    bitRate: 'h',
    windowBorder: true,
    autoPlay: false
};

function writeFile(target) {
    fs.writeFileSync(configPath, JSON.stringify(target, null, 4), 'utf8');
}

export function getCurrent() {
    let settings = defaultSettings;
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
        writeFile(defaultSettings);
    } else if (!fs.existsSync(configPath)) {
        writeFile(defaultSettings);
    } else {
        try {
            settings = JSON.parse(fs.readFileSync(configPath).toString());
        } catch (err) {
            throw err;
        }
    }
    return settings;
}

export function set(target) {
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
        writeFile(target);
    } else {
        writeFile(target);
    }
    return target;
}
