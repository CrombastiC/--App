import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from 'axios';

const refreshTokenUrl = '/api/auth/refresh-token';
  
export type Response<T> = Promise<[boolean, T, AxiosResponse<T>]>;

class Request {
  constructor(config?: CreateAxiosDefaults) {
    // 打印初始化配置
    console.log('🔧 Request Instance Config:', {
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
    });

    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      ...config,
    });
  
      this.axiosInstance.interceptors.request.use(
        (axiosConfig: InternalAxiosRequestConfig) =>
          this.requestInterceptor(axiosConfig)
      );
      this.axiosInstance.interceptors.response.use(
        (response: AxiosResponse<unknown, unknown>) =>
          this.responseSuccessInterceptor(response),
        (error: any) => this.responseErrorInterceptor(error)
      );
    }
  
    private axiosInstance: AxiosInstance;
  
    private refreshTokenFlag = false;
    private requestQueue: {
      resolve: any;
      config: any;
      type: 'reuqest' | 'response';
    }[] = [];
    private limit = 100;
  
    private requestingCount = 0;
  
    setLimit(limit: number) {
      this.limit = limit;
    }
  
    private async requestInterceptor(
      axiosConfig: InternalAxiosRequestConfig
    ): Promise<any> {
    // 暂时注释掉refreshToken的特殊处理
    // if ([refreshTokenUrl].includes(axiosConfig.url || '')) {
    //   return Promise.resolve(axiosConfig);
    // }

    // if (this.refreshTokenFlag || this.requestingCount >= this.limit) {
    if (this.requestingCount >= this.limit) {
        return new Promise((resolve) => {
          this.requestQueue.push({
            resolve,
            config: axiosConfig,
            type: 'reuqest',
          });
        });
      }
  
      this.requestingCount += 1;

      // 从AsyncStorage获取token
      const token = await AsyncStorage.getItem('token');

      if (token) {
        axiosConfig.headers.Authorization = `Bearer ${token}`;
      }

      // 打印请求日志 (开发环境)
      if (__DEV__) {
        console.log('📤 Request:', {
          url: axiosConfig.url,
          method: axiosConfig.method,
          data: axiosConfig.data,
        });
      }

      return Promise.resolve(axiosConfig);
    }
  
    private requestByQueue() {
      if (!this.requestQueue.length) return;
  
      console.log(
        this.requestingCount,
        this.limit - this.requestingCount,
        'count'
      );
  
      Array.from({length: this.limit - this.requestingCount}).forEach(
        async () => {
          const record = this.requestQueue.shift();
          if (!record) {
            return;
          }
  
          const {config, resolve, type} = record;
          if (type === 'response') {
            resolve(await this.request(config));
          } else if (type === 'reuqest') {
            this.requestingCount += 1;
            const token = await AsyncStorage.getItem('token');
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            resolve(config);
          }
        }
      );
    }
  
  // 暂时注释掉refreshToken逻辑
  // private async refreshToken() {
  //   const refreshToken = await AsyncStorage.getItem('refreshToken');

  //   if (!refreshToken) {
  //     this.toLoginPage();
  //     return;
  //   }

  //   try {
  //     // 调用刷新token接口
  //     const response = await this.axiosInstance.post(refreshTokenUrl, {
  //       refreshToken,
  //     });

  //     const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

  //     // 保存新的token
  //     await AsyncStorage.setItem('token', newToken);
  //     await AsyncStorage.setItem('refreshToken', newRefreshToken);

  //     this.refreshTokenFlag = false;
  //     this.requestByQueue();
  //   } catch (error) {
  //     console.error('刷新Token失败:', error);
  //     this.toLoginPage();
  //   }
  // }
  
  private async responseSuccessInterceptor(
    response: AxiosResponse<any, any>
  ): Promise<any> {
    // 暂时注释掉refreshToken的特殊处理
    // if (response.config.url !== refreshTokenUrl) {
    //   this.requestingCount -= 1;
    //   if (this.requestQueue.length) {
    //     this.requestByQueue();
    //   }
    // }
    this.requestingCount -= 1;
    if (this.requestQueue.length) {
      this.requestByQueue();
    }

      // 打印响应日志 (开发环境)
      if (__DEV__) {
        console.log('📥 Response:', {
          url: response.config.url,
          status: response.status,
          data: response.data,
        });
      }

      return Promise.resolve([false, response.data, response]);
    }
  
    private async responseErrorInterceptor(error: any): Promise<any> {
      // 详细的错误日志 - 始终打印，不只在开发环境
      console.error('❌ 网络请求错误详情:', {
        完整URL: error.config?.baseURL + error.config?.url,
        请求URL: error.config?.url,
        baseURL: error.config?.baseURL,
        错误信息: error.message,
        错误代码: error.code,
        HTTP状态: error.response?.status,
        状态文本: error.response?.statusText,
        响应数据: error.response?.data,
      });

      if (__DEV__) {
        console.error('❌ Response Error:', {
          url: error.config?.url,
          message: error.message,
          status: error.response?.status,
        });
      }

      this.requestingCount -= 1;
      const {config, status} = error?.response || {};

    // 401 未授权，刷新token（暂时注释掉）
    // if (status === 401) {
    //   return new Promise((resolve) => {
    //     this.requestQueue.unshift({resolve, config, type: 'response'});
    //     if (this.refreshTokenFlag) return;

    //     this.refreshTokenFlag = true;
    //     this.refreshToken();
    //   });
    // } else {
    if (status === 401) {
      // 暂时直接跳转到登录页
      this.toLoginPage();
      return Promise.resolve([true, error?.response?.data]);
    } else {
        // 其他错误
        const errorMessage = error.response?.data?.message || error.message || '请求失败';
        console.warn('请求错误:', errorMessage);
        
        // 这里可以显示Toast提示
        // Toast.show({ type: 'error', text1: errorMessage });
        
        return Promise.resolve([true, error?.response?.data]);
      }
    }
  
    private reset() {
      this.requestQueue = [];
      this.refreshTokenFlag = false;
      this.requestingCount = 0;
    }
  
    private async toLoginPage() {
      this.reset();
      
      // 清除存储
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userId');
      
      console.warn('Token已失效，请重新登录');
      
      // 使用expo-router跳转到登录页
      // import { router } from 'expo-router';
      // router.replace('/login');
    }
  
    request<T, D = any>(config: AxiosRequestConfig<D>): Response<T> {
      return this.axiosInstance(config);
    }
  
    get<T, D = any>(url: string, params?: any, config?: AxiosRequestConfig<D>): Response<T> {
      return this.axiosInstance.get(url, { params, ...config });
    }
  
    post<T, D = any>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>
    ): Response<T> {
      return this.axiosInstance.post(url, data, config);
    }
  
    put<T, D = any>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>
    ): Response<T> {
      return this.axiosInstance.put(url, data, config);
    }
  
    delete<T, D = any>(url: string, config?: AxiosRequestConfig<D>): Response<T> {
      return this.axiosInstance.delete(url, config);
    }

    /**
     * PATCH请求
     */
    patch<T, D = any>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>
    ): Response<T> {
      return this.axiosInstance.patch(url, data, config);
    }

    /**
     * 上传文件
     */
    upload<T>(
      url: string,
      file: any,
      config?: AxiosRequestConfig
    ): Response<T> {
      const formData = new FormData();
      formData.append('file', file);

      return this.axiosInstance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config,
      });
    }
  }

const request = new Request();

export default request;
  