import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('records');

import * as es from 'event-stream';

export const records = delimiter => ({

  count: readable => {
    return new Promise((resolve, reject) => {
      let count = 0;
      readable.pipe(es.split(delimiter))
        .on('data', data => { if (data.trim()) count++; })
        .on('end', () => resolve(count))
        .on('error', err => { reject(`count records got error: ${err}`); });
    })
  },

  get: readable => {
    return new Promise((resolve, reject) => {
      let records: any[] = [];
      debug(`reading records`);
      readable.pipe(es.split(delimiter))
        .on('data', data => {
          if (data.trim())
            records.push(JSON.parse(data));
        })
        .on('end', () => {
          debug(`read ${records.length} records`);
          resolve(records);
        })
        .on('error', err => { reject(`get record got error: ${err}`); });
    });
  },

  put: (records, writable) => {
    return new Promise((resolve, reject) => {
      debug(`writing ${records.length} records`);
      records.forEach(r => {
        writable.write(JSON.stringify(r));
        writable.write(delimiter);
      });
      debug(`wrote ${records.length} records`);
      writable.end();
      writable.on('close', resolve);
      writable.on('finish', resolve);
      writable.on('error', reject);
    });
  }

});
