import { orders, Order } from '@/data/orders';

class OrderStore {
  private static instance: OrderStore;
  private orders: Order[] = [...orders];

  private constructor() {}

  static getInstance(): OrderStore {
    if (!OrderStore.instance) {
      OrderStore.instance = new OrderStore();
    }
    return OrderStore.instance;
  }

  getAllOrders(): Order[] {
    return [...this.orders];
  }

  getOrderById(id: number): Order | null {
    return this.orders.find(order => order.id === id) || null;
  }

  createOrder(orderData: {
    plan_id: number;
    user_email?: string;
    user_name?: string;
    user_id?: number;
    amount: number;
  }): Order {
    const newId = Math.max(...this.orders.map(o => o.id), 0) + 1;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15分鐘後過期

    const newOrder: Order = {
      id: newId,
      plan_id: orderData.plan_id,
      user_email: orderData.user_email,
      user_name: orderData.user_name,
      user_id: orderData.user_id,
      status: 'CREATED',
      amount: orderData.amount,
      created_at: now,
      updated_at: now,
      expires_at: expiresAt
    };

    this.orders.push(newOrder);
    return newOrder;
  }

  updateOrderStatus(id: number, status: 'COMPLETED' | 'CANCELED', paymentId?: string): Order | null {
    const orderIndex = this.orders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      return null;
    }

    const updatedOrder = {
      ...this.orders[orderIndex],
      status,
      payment_id: paymentId,
      updated_at: new Date().toISOString()
    };

    this.orders[orderIndex] = updatedOrder;
    return updatedOrder;
  }

  // 清理過期訂單
  cleanupExpiredOrders(): void {
    const now = Date.now();
    this.orders = this.orders.map(order => {
      if (order.status === 'CREATED' && new Date(order.expires_at).getTime() < now) {
        return {
          ...order,
          status: 'CANCELED' as const,
          updated_at: new Date().toISOString()
        };
      }
      return order;
    });
  }
}

export const orderStore = OrderStore.getInstance();