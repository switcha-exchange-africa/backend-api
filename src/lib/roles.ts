const AccessControl = require('accesscontrol');


const RoleGrants = {
  user: {
    rate: {
      "read:any": ['*']
    },
    referral: {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    crypto: {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    'send-money': {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    'fiat-wallet': {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    'virtual-account': {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    'airtime-data': {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    'virtual-card': {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    'physical-card': {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    'transaction-pin': {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    'transaction': {
      "read:own": ['*'],
    },
    kyc: {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    misc: {
      "create:own": ['*'],
      "read:own": ['*'],
    },
    withdrawal: {
      "create:own": ['*'],
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    subscription: {
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
    notification: {
      "read:own": ['*'],
      "update:own": ['*'],
      "delete:own": ['*']
    },
  },
  'super-admin': {
    rate: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    referral: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    crypto: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    feature: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    lien: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    'send-money': {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    'fiat-wallet': {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    'virtual-account': {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    'airtime-data': {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    'virtual-card': {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    'physical-card': {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },

    'transaction-pin': {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    'transaction': {
      "read:any": ['*'],
      "create:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    kyc: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    misc: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    withdrawal: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    subscription: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    notification: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    roles: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    }
  },
  finance: {
    rate: {
      "read:any": ['*'],
    },
    referral: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    transaction: {
      "read:any": ['*'],
      "update:any": ['*'],
    },
    withdrawal: {
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    crypto: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    lien: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    'send-money': {
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    'fiat-wallet': {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
  },
  'customer-care': {
    rate: {
      "read:any": ['*'],
    },
    referral: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    crypto: {
      "read:any": ['*'],
    },
    'send-money': {
      "read:any": ['*'],
    },
    'fiat-wallet': {
      "read:any": ['*'],
    },
    'virtual-account': {
      "read:any": ['*'],
    },
    'airtime-data': {
      "read:any": ['*'],
    },
    'virtual-card': {
      "read:any": ['*'],
    },
    'physical-card': {
      "read:any": ['*'],
    },
    'transaction-pin': {
      "read:any": ['*'],
    },
    'transaction': {
      "read:any": ['*'],
    },
    kyc: {
      "read:any": ['*'],
    },
    misc: {
      "read:any": ['*'],
    },
    withdrawal: {
      "read:any": ['*'],
    },
    subscription: {
      "read:any": ['*'],
    },
    notification: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
    roles: {
      "read:any": ['*'],
    }
  },
  developer: {
    rate: {
      "read:any": ['*'],
    },
    faucet: {
      "create:any": ['*'],
      "read:any": ['*'],
      "update:any": ['*'],
      "delete:any": ['*']
    },
  },
};

const ac = new AccessControl(RoleGrants);

ac.grant(['developer', 'super-admin', 'finance', 'staff']).extend('user');
ac.grant(['super-admin']).extend('developer');

export default ac
