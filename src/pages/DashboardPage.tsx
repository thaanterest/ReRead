import { useState, useEffect } from 'react';
import {
  Check,
  Clock,
  Package,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ShoppingBag,
  Store,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  apiGetMyOrders,
  apiGetMySales,
  apiUpdateOrderShipping,
  apiConfirmOrderDelivery,
  type OrderData,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const COURIERS: Record<string, { name: string; logo: string; trackUrl: string }> = {
  flash: { name: 'Flash Express', logo: '⚡', trackUrl: 'https://flashexpress.co.th/' },
  kerry: { name: 'Kerry Express', logo: '🔴', trackUrl: 'https://th.kerryexpress.com/' },
  jandt: { name: 'J&T Express', logo: '🟠', trackUrl: 'https://www.jtexpress.co.th/' },
  thaipost: { name: 'ไปรษณีย์ไทย', logo: '📮', trackUrl: 'https://track.thailandpost.co.th/' },
};

const ORDER_STEPS = [
  { label: 'สั่งซื้อแล้ว', icon: Clock },
  { label: 'ชำระเงินเรียบร้อย', icon: Check },
  { label: 'กำลังจัดส่ง', icon: Package },
  { label: 'ได้รับหนังสือแล้ว', icon: CheckCircle2 },
];

function getOrderStepIndex(status: string): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'paid':
      return 1;
    case 'shipped':
      return 2;
    case 'completed':
      return 3;
    default:
      return 1;
  }
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuth() || {};
  const [activeTab, setActiveTab] = useState<'purchases' | 'sales'>('purchases');
  const [myOrders, setMyOrders] = useState<OrderData[]>([]);
  const [mySales, setMySales] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Shipping update form state
  const [shippingForm, setShippingForm] = useState<{
    orderId: string;
    courier: string;
    trackingNo: string;
    note: string;
  } | null>(null);
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [ordersRes, salesRes] = await Promise.all([
        apiGetMyOrders().catch(() => ({ success: false, data: [] })),
        apiGetMySales().catch(() => ({ success: false, data: [] })),
      ]);

      if (ordersRes.success && ordersRes.data) {
        setMyOrders(ordersRes.data);
        if (ordersRes.data.length > 0 && !expandedId) {
          setExpandedId(ordersRes.data[0].id);
        }
      }
      if (salesRes.success && salesRes.data) {
        setMySales(salesRes.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const handleConfirmDelivery = async (orderId: string) => {
    if (!confirm('ยืนยันว่าคุณได้รับหนังสือเรียบร้อยแล้วใช่หรือไม่?')) return;
    try {
      const res = await apiConfirmOrderDelivery(orderId);
      if (res.success) {
        alert('ยืนยันการรับหนังสือเรียบร้อยแล้ว ขอบคุณที่ใช้งาน ReRead!');
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการยืนยัน');
    }
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm || !shippingForm.trackingNo) return;
    setIsUpdatingShipping(true);
    try {
      const res = await apiUpdateOrderShipping(shippingForm.orderId, {
        courier: shippingForm.courier,
        tracking_no: shippingForm.trackingNo,
        shipping_note: shippingForm.note,
      });
      if (res.success) {
        alert('อัปเดตข้อมูลการจัดส่งสำเร็จแล้ว ผู้ซื้อสามารถติดตามพัสดุได้ทันที');
        setShippingForm(null);
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถอัปเดตข้อมูลการจัดส่งได้');
    } finally {
      setIsUpdatingShipping(false);
    }
  };

  const currentList = activeTab === 'purchases' ? myOrders : mySales;

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-medium mb-3">แผงควบคุมการซื้อขาย & แลกเปลี่ยน</h1>
        <p className="text-text-main/70 text-lg">ติดตามสถานะคำสั่งซื้อ การจัดส่ง และการส่งต่อหนังสือของคุณ</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-main mb-8 gap-8">
        <button
          onClick={() => { setActiveTab('purchases'); setExpandedId(null); }}
          className={`pb-4 font-heading text-lg font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'purchases'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-main/60 hover:text-text-main'
          }`}
        >
          <ShoppingBag className="w-5 h-5" /> คำสั่งซื้อของฉัน ({myOrders.length})
        </button>
        <button
          onClick={() => { setActiveTab('sales'); setExpandedId(null); }}
          className={`pb-4 font-heading text-lg font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'sales'
              ? 'border-accent text-accent'
              : 'border-transparent text-text-main/60 hover:text-text-main'
          }`}
        >
          <Store className="w-5 h-5" /> รายการที่ฉันขาย ({mySales.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border-main rounded-lg bg-bg-secondary/30 p-8">
          <div className="text-4xl mb-3">{activeTab === 'purchases' ? '📦' : '🏷️'}</div>
          <h3 className="font-heading text-xl font-medium mb-2 text-text-main">
            {activeTab === 'purchases' ? 'ยังไม่มีรายการคำสั่งซื้อ' : 'ยังไม่มีรายการขาย'}
          </h3>
          <p className="text-text-main/60 text-sm mb-6 max-w-md mx-auto">
            {activeTab === 'purchases'
              ? 'คุณสามารถเลือกดูหนังสือมือสองน่าสนใจและสั่งซื้อจากเพื่อนนักอ่านได้ที่หน้าค้นหา'
              : 'เมื่อมีเพื่อนนักอ่านสั่งซื้อหนังสือที่คุณลงขาย รายการคำสั่งซื้อจะปรากฏที่นี่'}
          </p>
          {activeTab === 'purchases' ? (
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-accent text-bg-main px-6 py-2.5 rounded-md font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              สำรวจหนังสือมือสอง <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/add-book"
              className="inline-flex items-center gap-2 bg-accent text-bg-main px-6 py-2.5 rounded-md font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              ลงรายการหนังสือเพื่อขาย <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {currentList.map((order) => {
            const stepIdx = getOrderStepIndex(order.status);
            const isExpanded = expandedId === order.id;
            const courierInfo = order.courier
              ? Object.values(COURIERS).find(c => c.name.toLowerCase().includes(order.courier?.toLowerCase() || '')) || {
                  name: order.courier,
                  logo: '📦',
                  trackUrl: 'https://track.thailandpost.co.th/',
                }
              : null;

            return (
              <div key={order.id} className="bg-bg-main border border-border-main rounded-md overflow-hidden shadow-sm">
                
                {/* Order Header Summary */}
                <button
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-bg-secondary/30 transition-colors text-left"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-8 min-w-0">
                    <div>
                      <span className="text-xs text-text-main/50 font-mono tracking-wider block">
                        {order.order_number}
                      </span>
                      <span className="text-xs text-text-main/60">
                        {new Date(order.created_at).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 min-w-0">
                      {order.book?.cover_url && (
                        <img
                          src={order.book.cover_url}
                          alt={order.book.title}
                          className="w-10 aspect-[3/4] object-cover rounded border border-border-main flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-sm font-heading font-medium truncate block text-text-main">
                          {order.book?.title || 'หนังสือที่สั่งซื้อ'}
                        </span>
                        <span className="text-xs text-text-main/60">
                          {activeTab === 'purchases'
                            ? `ผู้ขาย: ${order.seller?.display_name || 'เพื่อนนักอ่าน'}`
                            : `ผู้ซื้อ: ${order.buyer?.display_name || order.shipping_name}`}
                          {' · '}
                          <span className="text-accent font-medium font-heading">
                            ฿{order.total_amount?.toLocaleString() || 0}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs px-3 py-1 rounded-sm font-medium ${
                        order.status === 'completed'
                          ? 'bg-accent/15 text-accent'
                          : order.status === 'shipped'
                          ? 'bg-warning/15 text-warning'
                          : 'bg-bg-secondary text-text-main/70 border border-border-main'
                      }`}
                    >
                      {order.status === 'completed'
                        ? 'สำเร็จแล้ว'
                        : order.status === 'shipped'
                        ? 'กำลังจัดส่ง'
                        : order.status === 'paid'
                        ? 'ชำระเงินแล้ว'
                        : 'รอชำระเงิน'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-text-main/40 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border-main px-6 pb-6 pt-2 bg-bg-main">
                    
                    {/* Stepper */}
                    <div className="relative pt-6 pb-8">
                      <div className="absolute top-[38px] left-8 right-8 h-[2px] bg-border-main" />
                      <div
                        className="absolute top-[38px] left-8 h-[2px] bg-accent transition-all duration-500"
                        style={{ width: `${(stepIdx / (ORDER_STEPS.length - 1)) * 82}%` }}
                      />
                      <div className="relative flex justify-between w-full">
                        {ORDER_STEPS.map((step, index) => {
                          const isActive = index <= stepIdx;
                          const isCurrent = index === stepIdx;
                          const StepIcon = step.icon;
                          return (
                            <div key={index} className="flex flex-col items-center gap-2 z-10 w-28 text-center">
                              <div
                                className={`w-8 h-8 rounded-full border bg-bg-main flex items-center justify-center transition-colors ${
                                  isActive
                                    ? 'border-accent text-accent font-medium shadow-sm'
                                    : 'border-border-main text-text-main/30'
                                } ${isCurrent ? 'ring-4 ring-accent/15' : ''}`}
                              >
                                <StepIcon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-xs font-medium ${
                                  isActive ? 'text-text-main' : 'text-text-main/40'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping & Delivery Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-bg-secondary/40 rounded-md border border-border-main text-sm">
                      
                      {/* Recipient Address */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wider text-text-main/50 font-medium">
                          ข้อมูลที่อยู่จัดส่ง
                        </span>
                        <p className="font-medium text-text-main">
                          {order.shipping_name} ({order.shipping_phone})
                        </p>
                        <p className="text-text-main/70 text-xs leading-relaxed whitespace-pre-line">
                          {order.shipping_address}
                        </p>
                        {order.note && (
                          <p className="text-xs text-text-main/60 italic mt-1">
                            หมายเหตุ: "{order.note}"
                          </p>
                        )}
                      </div>

                      {/* Shipment & Tracking Details */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wider text-text-main/50 font-medium">
                          สถานะพัสดุ & ขนส่ง
                        </span>
                        {order.tracking_no && courierInfo ? (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{courierInfo.logo}</span>
                              <div>
                                <p className="font-medium">{courierInfo.name}</p>
                                <p className="text-xs text-text-main/60 font-mono mt-0.5">
                                  {order.tracking_no}
                                </p>
                              </div>
                            </div>
                            <a
                              href={courierInfo.trackUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-xs text-accent border border-accent/30 px-3 py-1.5 rounded-md hover:bg-accent/5 transition-colors w-fit font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> ตรวจสอบพัสดุบนเว็บ {courierInfo.name}
                            </a>
                            {order.shipping_note && (
                              <p className="text-xs text-text-main/60 italic">
                                บันทึกจากผู้ส่ง: "{order.shipping_note}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-text-main/60 py-2">
                            {order.status === 'paid'
                              ? 'ผู้ขายได้รับการชำระเงินแล้ว อยู่ระหว่างจัดเตรียมพัสดุ'
                              : 'ยังไม่มีข้อมูลการจัดส่ง'}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Seller Shipping Input Form (when activeTab === 'sales' and status !== 'completed') */}
                    {activeTab === 'sales' && shippingForm?.orderId === order.id && (
                      <form onSubmit={handleSaveShipping} className="mt-5 p-4 border border-accent/40 rounded-md bg-accent/5 flex flex-col gap-4">
                        <h4 className="font-heading font-medium text-text-main text-sm flex items-center gap-2">
                          <Package className="w-4 h-4 text-accent" /> กรอกข้อมูลบริษัทขนส่งและเลขพัสดุ
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium">บริษัทขนส่ง</label>
                            <select
                              value={shippingForm.courier}
                              onChange={(e) => setShippingForm({ ...shippingForm, courier: e.target.value })}
                              className="bg-bg-main border border-border-main rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
                            >
                              <option value="Flash Express">Flash Express ⚡</option>
                              <option value="Kerry Express">Kerry Express 🔴</option>
                              <option value="J&T Express">J&T Express 🟠</option>
                              <option value="ไปรษณีย์ไทย">ไปรษณีย์ไทย 📮</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium">เลขพัสดุ (Tracking No.) *</label>
                            <input
                              type="text"
                              required
                              value={shippingForm.trackingNo}
                              onChange={(e) => setShippingForm({ ...shippingForm, trackingNo: e.target.value })}
                              placeholder="เช่น TH12345678"
                              className="bg-bg-main border border-border-main rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium">ข้อความแจ้งผู้ซื้อ (ถ้ามี)</label>
                          <input
                            type="text"
                            value={shippingForm.note}
                            onChange={(e) => setShippingForm({ ...shippingForm, note: e.target.value })}
                            placeholder="เช่น จัดส่งรอบเช้าให้เรียบร้อยแล้วครับ ขอบคุณครับ"
                            className="bg-bg-main border border-border-main rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShippingForm(null)}
                            className="px-4 py-2 border border-border-main rounded-md text-xs font-medium text-text-main/70 hover:bg-bg-secondary"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="submit"
                            disabled={isUpdatingShipping}
                            className="flex items-center gap-1.5 bg-accent text-bg-main px-5 py-2 rounded-md text-xs font-medium hover:bg-accent/90 disabled:opacity-70 shadow-sm"
                          >
                            {isUpdatingShipping && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            บันทึกข้อมูลจัดส่ง
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Action Bar */}
                    <div className="flex justify-end gap-3 mt-5 border-t border-border-main pt-4">
                      {/* Buyer Actions */}
                      {activeTab === 'purchases' && order.status === 'shipped' && (
                        <button
                          onClick={() => handleConfirmDelivery(order.id)}
                          className="bg-accent text-bg-main px-6 py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors shadow-sm flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> ยืนยันว่าได้รับหนังสือแล้ว
                        </button>
                      )}

                      {/* Seller Actions */}
                      {activeTab === 'sales' && order.status !== 'completed' && !shippingForm && (
                        <button
                          onClick={() =>
                            setShippingForm({
                              orderId: order.id,
                              courier: order.courier || 'Flash Express',
                              trackingNo: order.tracking_no || '',
                              note: order.shipping_note || '',
                            })
                          }
                          className="bg-accent text-bg-main px-5 py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors shadow-sm flex items-center gap-2"
                        >
                          <Package className="w-4 h-4" />
                          {order.tracking_no ? 'แก้ไขเลขพัสดุ' : 'กรอกเลขพัสดุจัดส่ง'}
                        </button>
                      )}

                      {order.status === 'completed' && (
                        <div className="flex items-center gap-2 text-accent text-xs font-medium px-3 py-2 bg-accent/10 rounded-md">
                          <CheckCircle2 className="w-4 h-4" /> การส่งต่อหนังสือเสร็จสมบูรณ์เรียบร้อย
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
