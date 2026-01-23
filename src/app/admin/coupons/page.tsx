'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Ticket,
    Percent,
    DollarSign,
    Calendar,
    Trash2,
    Edit2,
    Copy,
    Check,
    X
} from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderAmount: number | null;
    maxDiscount: number | null;
    usageLimit: number | null;
    usedCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
}

// Format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format date
function formatDate(date: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date));
}

export default function CouponsPage() {
    const router = useRouter();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
        value: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
        isActive: true,
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons');
            const data = await res.json();
            setCoupons(data.coupons || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const body = {
            code: formData.code.toUpperCase(),
            type: formData.type,
            value: parseFloat(formData.value),
            minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: formData.isActive,
        };

        try {
            const res = await fetch('/api/admin/coupons', {
                method: editingCoupon ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCoupon ? { ...body, id: editingCoupon.id } : body),
            });

            if (res.ok) {
                setShowModal(false);
                resetForm();
                fetchCoupons();
            } else {
                const error = await res.json();
                alert(error.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xác nhận xóa mã giảm giá này?')) return;

        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                fetchCoupons();
            }
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.discountType,
            value: coupon.discountValue.toString(),
            minOrderAmount: coupon.minOrderAmount?.toString() || '',
            maxDiscount: coupon.maxDiscount?.toString() || '',
            usageLimit: coupon.usageLimit?.toString() || '',
            startDate: coupon.startDate.split('T')[0],
            endDate: coupon.endDate.split('T')[0],
            isActive: coupon.isActive,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            type: 'PERCENTAGE',
            value: '',
            minOrderAmount: '',
            maxDiscount: '',
            usageLimit: '',
            startDate: '',
            endDate: '',
            isActive: true,
        });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    const isExpired = (endDate: string) => new Date(endDate) < new Date();
    const isUpcoming = (startDate: string) => new Date(startDate) > new Date();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Mã giảm giá</h1>
                    <p className="text-neutral-400 text-sm mt-1">{coupons.length} mã</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Tạo mã mới
                </button>
            </div>

            {/* Search */}
            <div className="max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Tìm mã giảm giá..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    />
                </div>
            </div>

            {/* Coupons List */}
            {loading ? (
                <div className="text-center py-12 text-neutral-500">Đang tải...</div>
            ) : filteredCoupons.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
                    Chưa có mã giảm giá nào
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCoupons.map((coupon) => (
                        <div
                            key={coupon.id}
                            className={`bg-neutral-900 border rounded-xl p-4 ${!coupon.isActive || isExpired(coupon.endDate)
                                ? 'border-neutral-800 opacity-60'
                                : 'border-neutral-700'
                                }`}
                        >
                            {/* Code */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-emerald-400" />
                                    <code className="text-lg font-mono font-bold text-white">
                                        {coupon.code}
                                    </code>
                                </div>
                                <button
                                    onClick={() => copyCode(coupon.code)}
                                    className="p-1.5 hover:bg-neutral-800 rounded transition-colors"
                                >
                                    {copiedCode === coupon.code ? (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-neutral-500" />
                                    )}
                                </button>
                            </div>

                            {/* Value */}
                            <div className="flex items-center gap-2 mb-3">
                                {coupon.discountType === 'PERCENTAGE' ? (
                                    <>
                                        <Percent className="w-4 h-4 text-neutral-500" />
                                        <span className="text-2xl font-bold text-emerald-400">
                                            {coupon.discountValue}%
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="w-4 h-4 text-neutral-500" />
                                        <span className="text-2xl font-bold text-emerald-400">
                                            {formatCurrency(coupon.discountValue)}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Details */}
                            <div className="space-y-1 text-sm text-neutral-400 mb-3">
                                {coupon.minOrderAmount && (
                                    <p>Đơn tối thiểu: {formatCurrency(coupon.minOrderAmount)}</p>
                                )}
                                {coupon.maxDiscount && coupon.discountType === 'PERCENTAGE' && (
                                    <p>Giảm tối đa: {formatCurrency(coupon.maxDiscount)}</p>
                                )}
                                {coupon.usageLimit && (
                                    <p>Đã dùng: {coupon.usedCount}/{coupon.usageLimit}</p>
                                )}
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                                <Calendar className="w-3 h-3" />
                                <span>
                                    {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span
                                    className={`text-xs px-2 py-1 rounded ${isExpired(coupon.endDate)
                                        ? 'bg-red-900/50 text-red-400'
                                        : isUpcoming(coupon.startDate)
                                            ? 'bg-yellow-900/50 text-yellow-400'
                                            : coupon.isActive
                                                ? 'bg-emerald-900/50 text-emerald-400'
                                                : 'bg-neutral-800 text-neutral-400'
                                        }`}
                                >
                                    {isExpired(coupon.endDate)
                                        ? 'Hết hạn'
                                        : isUpcoming(coupon.startDate)
                                            ? 'Sắp diễn ra'
                                            : coupon.isActive
                                                ? 'Đang hoạt động'
                                                : 'Tạm dừng'}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEdit(coupon)}
                                        className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg">
                        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-white">
                                {editingCoupon ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-neutral-800 rounded"
                            >
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Code */}
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">
                                    Mã giảm giá *
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="VD: SALE50"
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white uppercase focus:outline-none focus:border-neutral-500"
                                    required
                                />
                            </div>

                            {/* Type & Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Loại giảm giá *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    >
                                        <option value="PERCENTAGE">Phần trăm (%)</option>
                                        <option value="FIXED_AMOUNT">Số tiền cố định</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Giá trị *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        placeholder={formData.type === 'PERCENTAGE' ? '10' : '50000'}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Min Order & Max Discount */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Đơn tối thiểu (VND)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Giảm tối đa (VND)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                        placeholder="Không giới hạn"
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    />
                                </div>
                            </div>

                            {/* Usage Limit */}
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">
                                    Số lần sử dụng tối đa
                                </label>
                                <input
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    placeholder="Không giới hạn"
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Ngày bắt đầu *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Ngày kết thúc *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Active */}
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-neutral-300">Kích hoạt ngay</span>
                            </label>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                                >
                                    {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
