import { StorageUtils } from './storage';

export interface TopUpRecord {
  id: string;
  amount: number;
  bonus: number;
  totalAmount: number;
  timestamp: number;
  status: 'success' | 'failed';
}

const TOP_UP_RECORDS_KEY = 'topUpRecords';
const ACCOUNT_BALANCE_KEY = 'accountBalance';
const USER_POINTS_KEY = 'userPoints';

export const topUpStorage = {
  // 获取所有充值记录
  async getRecords(): Promise<TopUpRecord[]> {
    try {
      const records = await StorageUtils.getObject<TopUpRecord[]>(TOP_UP_RECORDS_KEY);
      return records || [];
    } catch (error) {
      console.error('获取充值记录失败:', error);
      return [];
    }
  },

  // 添加充值记录
  async addRecord(record: Omit<TopUpRecord, 'id' | 'timestamp'>): Promise<void> {
    try {
      const records = await this.getRecords();
      const newRecord: TopUpRecord = {
        ...record,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      records.unshift(newRecord); // 新记录放在最前面
      await StorageUtils.setObject(TOP_UP_RECORDS_KEY, records);

      // 更新账户余额
      const currentBalance = await this.getBalance();
      await this.setBalance(currentBalance + record.totalAmount);
    } catch (error) {
      console.error('保存充值记录失败:', error);
    }
  },

  // 清除所有记录（用于测试）
  async clearRecords(): Promise<void> {
    try {
      await StorageUtils.delete(TOP_UP_RECORDS_KEY);
    } catch (error) {
      console.error('清除充值记录失败:', error);
    }
  },

  // 获取账户余额
  async getBalance(): Promise<number> {
    try {
      const balance = await StorageUtils.getNumber(ACCOUNT_BALANCE_KEY);
      return balance || 0;
    } catch (error) {
      console.error('获取账户余额失败:', error);
      return 0;
    }
  },

  // 设置账户余额
  async setBalance(balance: number): Promise<void> {
    try {
      await StorageUtils.setNumber(ACCOUNT_BALANCE_KEY, balance);
    } catch (error) {
      console.error('设置账户余额失败:', error);
    }
  },

  // 增加余额
  async addBalance(amount: number): Promise<void> {
    try {
      const currentBalance = await this.getBalance();
      await this.setBalance(currentBalance + amount);
    } catch (error) {
      console.error('增加余额失败:', error);
    }
  },

  // 减少余额
  async subtractBalance(amount: number): Promise<void> {
    try {
      const currentBalance = await this.getBalance();
      const newBalance = Math.max(0, currentBalance - amount);
      await this.setBalance(newBalance);
    } catch (error) {
      console.error('减少余额失败:', error);
    }
  },

  // 获取积分
  async getPoints(): Promise<number> {
    try {
      const points = await StorageUtils.getNumber(USER_POINTS_KEY);
      return points || 0;
    } catch (error) {
      console.error('获取积分失败:', error);
      return 0;
    }
  },

  // 设置积分
  async setPoints(points: number): Promise<void> {
    try {
      await StorageUtils.setNumber(USER_POINTS_KEY, points);
    } catch (error) {
      console.error('设置积分失败:', error);
    }
  },

  // 增加积分
  async addPoints(amount: number): Promise<void> {
    try {
      const currentPoints = await this.getPoints();
      await this.setPoints(currentPoints + amount);
    } catch (error) {
      console.error('增加积分失败:', error);
    }
  },

  // 减少积分
  async subtractPoints(amount: number): Promise<void> {
    try {
      const currentPoints = await this.getPoints();
      const newPoints = Math.max(0, currentPoints - amount);
      await this.setPoints(newPoints);
    } catch (error) {
      console.error('减少积分失败:', error);
    }
  },
};
