import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { IGenericRepository } from './generic-repository.abstract';

export abstract class IDataServices {
  abstract users: IGenericRepository<User>;
  abstract wallets: IGenericRepository<Wallet>;
}
