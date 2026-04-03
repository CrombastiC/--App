import dayjs from 'dayjs';

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 * @param dateString 日期字符串或日期对象
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (dateString: string | Date): string => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 格式化日期为 YYYY-MM-DD
 * @param dateString 日期字符串或日期对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (dateString: string | Date): string => {
  return dayjs(dateString).format('YYYY-MM-DD');
};

/**
 * 格式化日期为中文格式 YYYY年MM月DD日
 * @param dateString 日期字符串或日期对象
 * @returns 格式化后的日期字符串
 */
export const formatDateChinese = (dateString: string | Date): string => {
  return dayjs(dateString).format('YYYY年MM月DD日');
};

/**
 * 格式化时间为 HH:mm:ss
 * @param dateString 日期字符串或日期对象
 * @returns 格式化后的时间字符串
 */
export const formatTime = (dateString: string | Date): string => {
  return dayjs(dateString).format('HH:mm:ss');
};

/**
 * 获取当前时间
 * @returns dayjs对象
 */
export const now = () => {
  return dayjs();
};

/**
 * 将Date对象转换为dayjs对象
 * @param date Date对象
 * @returns dayjs对象
 */
export const fromDate = (date: Date) => {
  return dayjs(date);
};

export default dayjs;
