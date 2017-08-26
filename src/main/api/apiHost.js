import debug from 'debug';
import { ipcMain } from 'electron';

import Api from './api';

const d = debug('Api');
const methodKeys = Object.getOwnPropertyNames(Api);

d('All Api methods: %O', methodKeys);

async function rejectTimeout(timeOut = 60000) {
    return await new Promise((_, reject) => {
        setTimeout(() => {
            reject(`request time out after ${timeOut} ms`);
        }, timeOut);
    });
}

methodKeys.map(methodName => {
    ipcMain.on(methodName, (event, invokeId, ...args) => {
        d('⬇️ %s', methodName);
        Promise.race([
            Api[methodName](...args),
            rejectTimeout()
        ]).then(data => {
            event.sender.send(`${methodName}${invokeId}`, data);
            d('⬆️ %s', methodName);
        }).catch(err => {
            event.sender.send(`${methodName}${invokeId}`, err);
            d('❌ %s %j', methodName, err);
        });
    });
});

ipcMain.on('getApiKeys', event => {
    event.returnValue = methodKeys;
});
