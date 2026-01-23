'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Store,
    Truck,
    CreditCard,
    Mail,
    User,
    Save,
    Plus,
    Trash2
} from 'lucide-react';

interface StoreSetting {
    storeName: string;
    storelogo: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;
    facebook: string;
    instagram: string;
    zalo: string;
}

interface ShippingZone {
    id?: string;
    name: string;
    fee: number;
    minOrder: number;
    freeShipThreshold: number;
}

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('store');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Store settings
    const [storeSettings, setStoreSettings] = useState<StoreSetting>({
        storeName: 'BY TRANG',
        storelogo: '',
        storeAddress: '',
        storePhone: '',
        storeEmail: '',
        facebook: '',
        instagram: '',
        zalo: '',
    });

    // Shipping zones
    const [shippingZones, setShippingZones] = useState<ShippingZone[]>([
        { name: 'Nội thành TP.HCM', fee: 20000, minOrder: 0, freeShipThreshold: 500000 },
        { name: 'Ngoại thành TP.HCM', fee: 30000, minOrder: 0, freeShipThreshold: 700000 },
        { name: 'Các tỉnh khác', fee: 40000, minOrder: 0, freeShipThreshold: 1000000 },
    ]);

    // Payment methods
    const [paymentMethods, setPaymentMethods] = useState({
        cod: true,
        bankTransfer: true,
        momo: false,
        vnpay: false,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.storeSettings) {
                    setStoreSettings(data.storeSettings);
                }
                if (data.shippingZones) {
                    setShippingZones(data.shippingZones);
                }
                if (data.paymentMethods) {
                    setPaymentMethods(data.paymentMethods);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeSettings,
                    shippingZones,
                    paymentMethods,
                }),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                alert('Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const addShippingZone = () => {
        setShippingZones([...shippingZones, { name: '', fee: 0, minOrder: 0, freeShipThreshold: 0 }]);
    };

    const removeShippingZone = (index: number) => {
        setShippingZones(shippingZones.filter((_, i) => i !== index));
    };

    const updateShippingZone = (index: number, field: keyof ShippingZone, value: string | number) => {
        const updated = [...shippingZones];
        updated[index] = { ...updated[index], [field]: value };
        setShippingZones(updated);
    };

    const tabs = [
        { key: 'store', label: 'Thông tin cửa hàng', icon: Store },
        { key: 'shipping', label: 'Vận chuyển', icon: Truck },
        { key: 'payment', label: 'Thanh toán', icon: CreditCard },
        { key: 'email', label: 'Email thông báo', icon: Mail },
        { key: 'admin', label: 'Tài khoản Admin', icon: User },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Cài đặt</h1>
                    <p className="text-neutral-400 text-sm mt-1">Cấu hình cửa hàng</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu thay đổi'}
                </button>
            </div>

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.key
                                        ? 'bg-neutral-700 text-white'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    {activeTab === 'store' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-white">Thông tin cửa hàng</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Tên cửa hàng
                                    </label>
                                    <input
                                        type="text"
                                        value={storeSettings.storeName}
                                        onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="text"
                                        value={storeSettings.storePhone}
                                        onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    value={storeSettings.storeAddress}
                                    onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={storeSettings.storeEmail}
                                    onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                />
                            </div>

                            <div className="border-t border-neutral-800 pt-6">
                                <h3 className="text-white font-medium mb-4">Mạng xã hội</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-1">
                                            Facebook
                                        </label>
                                        <input
                                            type="text"
                                            value={storeSettings.facebook}
                                            onChange={(e) => setStoreSettings({ ...storeSettings, facebook: e.target.value })}
                                            placeholder="https://facebook.com/..."
                                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-1">
                                            Instagram
                                        </label>
                                        <input
                                            type="text"
                                            value={storeSettings.instagram}
                                            onChange={(e) => setStoreSettings({ ...storeSettings, instagram: e.target.value })}
                                            placeholder="https://instagram.com/..."
                                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400 mb-1">
                                            Zalo
                                        </label>
                                        <input
                                            type="text"
                                            value={storeSettings.zalo}
                                            onChange={(e) => setStoreSettings({ ...storeSettings, zalo: e.target.value })}
                                            placeholder="Số điện thoại Zalo"
                                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-white">Khu vực vận chuyển</h2>
                                <button
                                    onClick={addShippingZone}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Thêm khu vực
                                </button>
                            </div>

                            <div className="space-y-4">
                                {shippingZones.map((zone, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-neutral-800 border border-neutral-700 rounded-xl"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <input
                                                type="text"
                                                value={zone.name}
                                                onChange={(e) => updateShippingZone(index, 'name', e.target.value)}
                                                placeholder="Tên khu vực"
                                                className="text-white font-medium bg-transparent border-none focus:outline-none"
                                            />
                                            <button
                                                onClick={() => removeShippingZone(index)}
                                                className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs text-neutral-500 mb-1">
                                                    Phí ship (VND)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={zone.fee}
                                                    onChange={(e) => updateShippingZone(index, 'fee', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-neutral-500 mb-1">
                                                    Đơn tối thiểu
                                                </label>
                                                <input
                                                    type="number"
                                                    value={zone.minOrder}
                                                    onChange={(e) => updateShippingZone(index, 'minOrder', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-neutral-500 mb-1">
                                                    Miễn ship từ
                                                </label>
                                                <input
                                                    type="number"
                                                    value={zone.freeShipThreshold}
                                                    onChange={(e) => updateShippingZone(index, 'freeShipThreshold', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-white">Phương thức thanh toán</h2>

                            <div className="space-y-4">
                                <label className="flex items-center gap-4 p-4 bg-neutral-800 border border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={paymentMethods.cod}
                                        onChange={(e) => setPaymentMethods({ ...paymentMethods, cod: e.target.checked })}
                                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <p className="text-white font-medium">Thanh toán khi nhận hàng (COD)</p>
                                        <p className="text-neutral-500 text-sm">Khách hàng trả tiền khi nhận hàng</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-4 bg-neutral-800 border border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={paymentMethods.bankTransfer}
                                        onChange={(e) => setPaymentMethods({ ...paymentMethods, bankTransfer: e.target.checked })}
                                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <p className="text-white font-medium">Chuyển khoản ngân hàng</p>
                                        <p className="text-neutral-500 text-sm">Hiển thị thông tin tài khoản ngân hàng</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-4 bg-neutral-800 border border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-600 transition-colors opacity-50">
                                    <input
                                        type="checkbox"
                                        checked={paymentMethods.momo}
                                        onChange={(e) => setPaymentMethods({ ...paymentMethods, momo: e.target.checked })}
                                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 text-emerald-500 focus:ring-emerald-500"
                                        disabled
                                    />
                                    <div>
                                        <p className="text-white font-medium">Ví MoMo</p>
                                        <p className="text-neutral-500 text-sm">Sắp ra mắt</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-4 bg-neutral-800 border border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-600 transition-colors opacity-50">
                                    <input
                                        type="checkbox"
                                        checked={paymentMethods.vnpay}
                                        onChange={(e) => setPaymentMethods({ ...paymentMethods, vnpay: e.target.checked })}
                                        className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 text-emerald-500 focus:ring-emerald-500"
                                        disabled
                                    />
                                    <div>
                                        <p className="text-white font-medium">VNPay</p>
                                        <p className="text-neutral-500 text-sm">Sắp ra mắt</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-white">Email thông báo</h2>
                            <p className="text-neutral-400 text-sm">
                                Cấu hình email gửi đến khách hàng khi có thay đổi trạng thái đơn hàng.
                            </p>
                            <div className="p-8 bg-neutral-800 border border-neutral-700 rounded-xl text-center">
                                <Mail className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                                <p className="text-neutral-500">Tính năng đang phát triển</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'admin' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-white">Tài khoản Admin</h2>
                            <p className="text-neutral-400 text-sm">
                                Quản lý tài khoản admin và phân quyền.
                            </p>
                            <div className="p-8 bg-neutral-800 border border-neutral-700 rounded-xl text-center">
                                <User className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                                <p className="text-neutral-500">Tính năng đang phát triển</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
