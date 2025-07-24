import { PaymentRequest, PaymentResponse, PaymentResult } from '@/types';

// Mock 金流服務配置
const MOCK_PAYMENT_API = {
  baseUrl: 'https://mock-payment-api.example.com',
  apiKey: 'test_api_key',
  endpoint: '/v1/payments'
};

// 生成隨機付款 ID
const generatePaymentId = (): string => {
  return `pay_${Math.random().toString(36).substr(2, 9)}`;
};

// 模擬網路延遲
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock 付款服務
export const paymentService = {
  /**
   * 建立付款
   * POST /v1/payments
   * 
   * 請求格式:
   * POST /v1/payments
   * X-API-Key: test_api_key
   * Content-Type: application/json
   * 
   * {
   *   "order_id": "ord_123",
   *   "amount": 1999,
   *   "description": "一年期會員方案",
   *   "return_url": "https://myapp.local/payment-result"
   * }
   * 
   * 成功回應 201 Created:
   * {
   *   "payment_id": "pay_abc789",
   *   "status": "successful | failed"
   * }
   */
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResult> {
    try {
      // 模擬 API 請求延遲
      await delay(1000 + Math.random() * 2000); // 1-3秒隨機延遲

      // 驗證必要欄位
      if (!paymentData.order_id || !paymentData.amount || !paymentData.description || !paymentData.return_url) {
        return {
          success: false,
          error: 'Missing required fields: order_id, amount, description, return_url'
        };
      }

      // 驗證金額
      if (paymentData.amount <= 0) {
        return {
          success: false,
          error: 'Amount must be greater than 0'
        };
      }

      // 模擬 API 請求
      console.log('Mock Payment API Request:', {
        url: `${MOCK_PAYMENT_API.baseUrl}${MOCK_PAYMENT_API.endpoint}`,
        method: 'POST',
        headers: {
          'X-API-Key': MOCK_PAYMENT_API.apiKey,
          'Content-Type': 'application/json'
        },
        body: {
          order_id: paymentData.order_id,
          amount: paymentData.amount,
          description: paymentData.description,
          return_url: paymentData.return_url
        }
      });

      // 模擬不同的付款結果 (80% 成功率)
      const successRate = 0.8;
      const isSuccess = Math.random() < successRate;

      const paymentResponse: PaymentResponse = {
        payment_id: generatePaymentId(),
        status: isSuccess ? 'successful' : 'failed'
      };

      console.log(`Mock Payment API Response (${isSuccess ? 'Success' : 'Failed'}):`, {
        status: 201,
        body: paymentResponse
      });

      if (isSuccess) {
        return {
          success: true,
          data: paymentResponse
        };
      } else {
        return {
          success: false,
          data: paymentResponse,
          error: '付款處理失敗，請稍後再試'
        };
      }
    } catch (error) {
      console.error('Payment API Error:', error);
      return {
        success: false,
        error: '付款服務暫時無法使用，請稍後再試'
      };
    }
  },

  /**
   * 查詢付款狀態 (額外功能)
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    try {
      await delay(500); // 模擬查詢延遲

      console.log('Mock Payment Status Query:', { paymentId });

      // 模擬查詢結果
      const statuses: Array<'successful' | 'failed'> = ['successful', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const paymentResponse: PaymentResponse = {
        payment_id: paymentId,
        status: randomStatus
      };

      return {
        success: true,
        data: paymentResponse
      };
    } catch (error) {
      console.error('Payment Status Query Error:', error);
      return {
        success: false,
        error: '無法查詢付款狀態'
      };
    }
  },

  /**
   * 格式化付款金額顯示
   */
  formatAmount(amount: number): string {
    return `NT$ ${amount.toLocaleString()}`;
  },

  /**
   * 生成訂單 ID
   */
  generateOrderId(prefix: string = 'ord'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`;
  }
};

export default paymentService;