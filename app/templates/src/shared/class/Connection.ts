import { Connection as MongoConnection, createConnection } from 'mongoose';
import { injectable } from 'inversify';

import env from '../../config/env';
import MongoNotConnectedException from '../exceptions/MongoNotConnectedException';

@injectable()
export default class Connection {
  private db: MongoConnection;

  connect(): Promise<this> {
    return new Promise(async (resolve, reject) => {
      try {
        this.db = await createConnection(`${env.mongodb_url}`, {
          authSource: env.mongodb_authsource ? env.mongodb_authsource : null,
          ssl: env.mongodb_replset ? true : false,
          replicaSet: env.mongodb_replset ? env.mongodb_replset : null,
          dbName: env.mongodb_database_name,
        });
        if (this.db.readyState !== 1) {
          throw new MongoNotConnectedException();
        }
        resolve(this);
      } catch (err) {
        console.error(err);
        reject(err);
        process.exit(1);
      }
    });
  }

  getConnection() {
    return this.db;
  }

  startSession() {
    return this.db.startSession();
  }

  useDB(databaseName: string) {
    return this.db.useDb(databaseName);
  }

  disconnect(): Promise<any> {
    return this.db.close();
  }
}
