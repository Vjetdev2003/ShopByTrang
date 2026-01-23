'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import {
    MapPin,
    Plus,
    Truck,
    Tag,
    CreditCard,
    ChevronRight,
    Check,
    X,
    Loader2,
    ShoppingBag,
    ChevronDown
} from 'lucide-react';

interface Address {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

interface CartItem {
    id: string;
    quantity: number;
    variant: {
        id: string;
        sku: string;
        color: string;
        size: string;
        images: string;
        product: {
            id: string;
            slug: string;
            name: string;
            images: string;
        };
        pricing: {
            basePrice: number;
            salePrice: number | null;
        } | null;
    };
}

interface Cart {
    id: string;
    items: CartItem[];
}

interface Province {
    code: number;
    name: string;
}

interface District {
    code: number;
    name: string;
}

interface Ward {
    code: number;
    name: string;
}

interface UserInfo {
    name: string;
    phone: string | null;
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(price);
}

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<Cart | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // Form state
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponValidating, setCouponValidating] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [note, setNote] = useState('');
    const [paymentMethod] = useState('COD');

    // Shipping
    const [shippingFee, setShippingFee] = useState(0);
    const [shippingLoading, setShippingLoading] = useState(false);

    // Vietnam provinces/districts/wards
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedWard, setSelectedWard] = useState<string>('');
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    // New address form
    const [newAddress, setNewAddress] = useState({
        label: 'Nhà',
        fullName: '',
        phone: '',
        street: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false
    });

    // Fetch provinces on mount
    useEffect(() => {
        fetchProvinces();
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    // Pre-fill user info when userInfo is loaded
    useEffect(() => {
        if (userInfo && showAddressForm && !newAddress.fullName && !newAddress.phone) {
            setNewAddress(prev => ({
                ...prev,
                fullName: prev.fullName || userInfo.name || '',
                phone: prev.phone || userInfo.phone || ''
            }));
        }
    }, [userInfo, showAddressForm]);

    const fetchProvinces = async () => {
        try {
            const res = await fetch('https://provinces.open-api.vn/api/p/');
            if (res.ok) {
                const data = await res.json();
                setProvinces(data);
            }
        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };

    const fetchDistricts = async (provinceCode: string) => {
        setLoadingDistricts(true);
        setDistricts([]);
        setWards([]);
        setSelectedDistrict('');
        setSelectedWard('');
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            if (res.ok) {
                const data = await res.json();
                setDistricts(data.districts || []);
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const fetchWards = async (districtCode: string) => {
        setLoadingWards(true);
        setWards([]);
        setSelectedWard('');
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            if (res.ok) {
                const data = await res.json();
                setWards(data.wards || []);
            }
        } catch (error) {
            console.error('Error fetching wards:', error);
        } finally {
            setLoadingWards(false);
        }
    };

    const handleProvinceChange = (provinceCode: string) => {
        setSelectedProvince(provinceCode);
        const province = provinces.find(p => p.code.toString() === provinceCode);
        setNewAddress(prev => ({ ...prev, city: province?.name || '', district: '', ward: '' }));
        if (provinceCode) {
            fetchDistricts(provinceCode);
        }
    };

    const handleDistrictChange = (districtCode: string) => {
        setSelectedDistrict(districtCode);
        const district = districts.find(d => d.code.toString() === districtCode);
        setNewAddress(prev => ({ ...prev, district: district?.name || '', ward: '' }));
        if (districtCode) {
            fetchWards(districtCode);
        }
    };

    const handleWardChange = (wardCode: string) => {
        setSelectedWard(wardCode);
        const ward = wards.find(w => w.code.toString() === wardCode);
        setNewAddress(prev => ({ ...prev, ward: ward?.name || '' }));
    };

    const fetchData = async () => {
        try {
            const [cartRes, addressRes, profileRes] = await Promise.all([
                fetch('/api/cart'),
                fetch('/api/addresses'),
                fetch('/api/profile')
            ]);

            if (cartRes.ok) {
                const cartData = await cartRes.json();
                setCart(cartData.cart);

                // Redirect if cart empty
                if (!cartData.cart || cartData.cart.items.length === 0) {
                    router.push('/cart');
                    return;
                }
            }

            if (addressRes.ok) {
                const addressData = await addressRes.json();
                setAddresses(addressData.addresses || []);

                // Auto-select default address
                const defaultAddr = addressData.addresses?.find((a: Address) => a.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                }
            }

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (profileData.user) {
                    setUserInfo({
                        name: profileData.user.name || '',
                        phone: profileData.user.phone || null
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate shipping when address changes
    useEffect(() => {
        if (selectedAddressId && cart) {
            calculateShipping();
        }
    }, [selectedAddressId, cart?.items]);

    const calculateShipping = async () => {
        const address = addresses.find(a => a.id === selectedAddressId);
        if (!address) return;

        setShippingLoading(true);
        try {
            const res = await fetch(`/api/shipping?city=${encodeURIComponent(address.city)}&subtotal=${subtotal}`);
            if (res.ok) {
                const data = await res.json();
                setShippingFee(data.fee);
            }
        } catch (error) {
            console.error('Error calculating shipping:', error);
        } finally {
            setShippingLoading(false);
        }
    };

    const getItemImage = (item: CartItem) => {
        try {
            const variantImages = JSON.parse(item.variant.images) as string[];
            if (variantImages.length > 0) return variantImages[0];
        } catch { /* ignore */ }
        try {
            const productImages = JSON.parse(item.variant.product.images) as string[];
            if (productImages.length > 0) return productImages[0];
        } catch { /* ignore */ }
        return '/placeholder.jpg';
    };

    const getItemPrice = (item: CartItem) => {
        return item.variant.pricing?.salePrice || item.variant.pricing?.basePrice || 0;
    };

    const subtotal = cart?.items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0) || 0;
    const discount = appliedCoupon?.discount || 0;
    const total = subtotal + shippingFee - discount;

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;

        setCouponValidating(true);
        setCouponError('');

        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, subtotal })
            });

            const data = await res.json();

            if (data.valid) {
                setAppliedCoupon({ code: data.coupon.code, discount: data.discount });
                setCouponError('');
            } else {
                setCouponError(data.error || 'Mã không hợp lệ');
                setAppliedCoupon(null);
            }
        } catch {
            setCouponError('Có lỗi xảy ra');
        } finally {
            setCouponValidating(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const resetAddressForm = () => {
        setNewAddress({
            label: 'Nhà',
            fullName: userInfo?.name || '',
            phone: userInfo?.phone || '',
            street: '',
            ward: '',
            district: '',
            city: '',
            isDefault: false
        });
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedWard('');
        setDistricts([]);
        setWards([]);
    };

    const saveNewAddress = async () => {
        if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.ward || !newAddress.district || !newAddress.city) {
            alert('Vui lòng điền đầy đủ thông tin địa chỉ');
            return;
        }

        try {
            const res = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAddress)
            });

            if (res.ok) {
                const data = await res.json();
                setAddresses([...addresses, data.address]);
                setSelectedAddressId(data.address.id);
                setShowAddressForm(false);
                resetAddressForm();
            }
        } catch {
            alert('Có lỗi xảy ra');
        }
    };

    const handleSubmit = async () => {
        if (!selectedAddressId) {
            alert('Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addressId: selectedAddressId,
                    couponCode: appliedCoupon?.code || null,
                    paymentMethod,
                    note: note || null
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Dispatch cart update event
                window.dispatchEvent(new Event('cart-updated'));
                // Redirect to success page
                router.push(`/order-success/${data.order.id}`);
            } else {
                alert(data.error || 'Có lỗi xảy ra khi đặt hàng');
            }
        } catch {
            alert('Có lỗi xảy ra khi đặt hàng');
        } finally {
            setSubmitting(false);
        }
    };

    const openAddressForm = () => {
        resetAddressForm();
        setShowAddressForm(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center py-20 text-neutral-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Đang tải...
                    </div>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                    <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <p className="text-neutral-500 mb-6">Giỏ hàng trống</p>
                    <Link href="/products" className="inline-block px-8 py-3 bg-neutral-900 text-white">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
                    <Link href="/cart" className="hover:text-neutral-900">Giỏ hàng</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-neutral-900 font-medium">Thanh toán</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-neutral-700" />
                                <h2 className="text-lg font-medium">Địa chỉ giao hàng</h2>
                            </div>

                            {addresses.length === 0 && !showAddressForm ? (
                                <button
                                    onClick={openAddressForm}
                                    className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Thêm địa chỉ mới
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map(addr => (
                                        <label
                                            key={addr.id}
                                            className={`block p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id
                                                ? 'border-neutral-900 bg-neutral-50'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{addr.fullName}</span>
                                                        <span className="text-sm text-neutral-500">{addr.phone}</span>
                                                        {addr.isDefault && (
                                                            <span className="text-xs px-2 py-0.5 bg-neutral-900 text-white rounded">
                                                                Mặc định
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-neutral-600 mt-1">
                                                        {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}

                                    {!showAddressForm && (
                                        <button
                                            onClick={openAddressForm}
                                            className="w-full py-3 border border-neutral-300 rounded-lg text-neutral-600 hover:bg-neutral-50 flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Thêm địa chỉ mới
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* New Address Form */}
                            {showAddressForm && (
                                <div className="mt-4 p-4 border border-neutral-200 rounded-lg space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-neutral-600 mb-1">Họ tên *</label>
                                            <input
                                                type="text"
                                                value={newAddress.fullName}
                                                onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-neutral-600 mb-1">Số điện thoại *</label>
                                            <input
                                                type="tel"
                                                value={newAddress.phone}
                                                onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-600 mb-1">Địa chỉ *</label>
                                        <input
                                            type="text"
                                            value={newAddress.street}
                                            onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                            placeholder="Số nhà, tên đường"
                                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {/* Province/City Dropdown */}
                                        <div>
                                            <label className="block text-sm text-neutral-600 mb-1">Tỉnh/TP *</label>
                                            <div className="relative">
                                                <select
                                                    value={selectedProvince}
                                                    onChange={e => handleProvinceChange(e.target.value)}
                                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500 appearance-none bg-white"
                                                >
                                                    <option value="">Chọn Tỉnh/TP</option>
                                                    {provinces.map(p => (
                                                        <option key={p.code} value={p.code}>{p.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        {/* District Dropdown */}
                                        <div>
                                            <label className="block text-sm text-neutral-600 mb-1">Quận/Huyện *</label>
                                            <div className="relative">
                                                <select
                                                    value={selectedDistrict}
                                                    onChange={e => handleDistrictChange(e.target.value)}
                                                    disabled={!selectedProvince || loadingDistricts}
                                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500 appearance-none bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">
                                                        {loadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'}
                                                    </option>
                                                    {districts.map(d => (
                                                        <option key={d.code} value={d.code}>{d.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        {/* Ward Dropdown */}
                                        <div>
                                            <label className="block text-sm text-neutral-600 mb-1">Phường/Xã *</label>
                                            <div className="relative">
                                                <select
                                                    value={selectedWard}
                                                    onChange={e => handleWardChange(e.target.value)}
                                                    disabled={!selectedDistrict || loadingWards}
                                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500 appearance-none bg-white disabled:bg-neutral-100 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">
                                                        {loadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'}
                                                    </option>
                                                    {wards.map(w => (
                                                        <option key={w.code} value={w.code}>{w.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={saveNewAddress}
                                            className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                                        >
                                            Lưu địa chỉ
                                        </button>
                                        <button
                                            onClick={() => setShowAddressForm(false)}
                                            className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Coupon Code */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Tag className="w-5 h-5 text-neutral-700" />
                                <h2 className="text-lg font-medium">Mã giảm giá</h2>
                            </div>

                            {appliedCoupon ? (
                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-800">{appliedCoupon.code}</span>
                                        <span className="text-green-600">-{formatPrice(appliedCoupon.discount)}</span>
                                    </div>
                                    <button onClick={removeCoupon} className="p-1 hover:bg-green-100 rounded">
                                        <X className="w-4 h-4 text-green-600" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Nhập mã giảm giá"
                                        className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500 uppercase"
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        disabled={couponValidating || !couponCode.trim()}
                                        className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {couponValidating && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Áp dụng
                                    </button>
                                </div>
                            )}
                            {couponError && (
                                <p className="text-red-500 text-sm mt-2">{couponError}</p>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-neutral-700" />
                                <h2 className="text-lg font-medium">Phương thức thanh toán</h2>
                            </div>

                            <label className="flex items-center gap-3 p-4 border border-neutral-900 rounded-lg bg-neutral-50">
                                <input type="radio" checked readOnly className="w-4 h-4" />
                                <div>
                                    <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                                    <p className="text-sm text-neutral-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                </div>
                            </label>
                        </div>

                        {/* Order Note */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-lg font-medium mb-4">Ghi chú đơn hàng</h2>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng..."
                                rows={3}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-500 resize-none"
                            />
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                            <h2 className="text-lg font-medium mb-4">Đơn hàng của bạn</h2>

                            {/* Items */}
                            <div className="space-y-4 max-h-80 overflow-y-auto">
                                {cart.items.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-16 h-20 relative bg-neutral-100 rounded flex-shrink-0">
                                            <Image
                                                src={getItemImage(item)}
                                                alt={item.variant.product.name}
                                                fill
                                                className="object-cover rounded"
                                                sizes="64px"
                                            />
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-900 text-white text-xs rounded-full flex items-center justify-center">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.variant.product.name}</p>
                                            <p className="text-xs text-neutral-500">{item.variant.color} / {item.variant.size}</p>
                                            <p className="text-sm font-medium mt-1">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            {/* Summary */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Tạm tính</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600 flex items-center gap-1">
                                        <Truck className="w-4 h-4" />
                                        Phí vận chuyển
                                    </span>
                                    {shippingLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : selectedAddressId ? (
                                        <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                                    ) : (
                                        <span className="text-neutral-400">Chọn địa chỉ</span>
                                    )}
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá</span>
                                        <span>-{formatPrice(discount)}</span>
                                    </div>
                                )}
                            </div>

                            <hr className="my-4" />

                            <div className="flex justify-between font-medium text-lg">
                                <span>Tổng cộng</span>
                                <span className="text-neutral-900">{formatPrice(total)}</span>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !selectedAddressId}
                                className="w-full mt-6 py-4 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
                            </button>

                            <p className="text-xs text-neutral-500 text-center mt-4">
                                Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
