'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ruler, Save } from 'lucide-react';

interface Measurement {
    id?: string;
    height?: number | null;
    weight?: number | null;
    bust?: number | null;
    waist?: number | null;
    hips?: number | null;
    shoulder?: number | null;
    armLength?: number | null;
    dressLength?: number | null;
    note?: string | null;
}

interface Props {
    initialData: Measurement | null;
}

const measurementFields = [
    { key: 'height', label: 'Chiều cao', unit: 'cm', placeholder: '160' },
    { key: 'weight', label: 'Cân nặng', unit: 'kg', placeholder: '50' },
    { key: 'bust', label: 'Vòng 1 (ngực)', unit: 'cm', placeholder: '88' },
    { key: 'waist', label: 'Vòng 2 (eo)', unit: 'cm', placeholder: '68' },
    { key: 'hips', label: 'Vòng 3 (mông)', unit: 'cm', placeholder: '92' },
    { key: 'shoulder', label: 'Vai', unit: 'cm', placeholder: '38' },
    { key: 'armLength', label: 'Dài tay', unit: 'cm', placeholder: '58' },
    { key: 'dressLength', label: 'Dài áo dài', unit: 'cm', placeholder: '140' },
];

export default function CustomerMeasurementForm({ initialData }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Measurement>(initialData || {});
    const [note, setNote] = useState(initialData?.note || '');
    // Success message state
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/profile/measurement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, note }),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Đã lưu số đo thành công!' });
                router.refresh();
                // Clear success message after 3 seconds
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Có lỗi kết nối.' });
        } finally {
            setLoading(false);
        }
    };

    const updateField = (key: string, value: string) => {
        const numValue = value ? parseFloat(value) : null;
        setData((prev) => ({ ...prev, [key]: numValue }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-900/30 rounded-lg text-emerald-500">
                    <Ruler className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-medium text-white">Số đo may áo dài</h2>
                    <p className="text-sm text-neutral-400">Cập nhật số đo để chúng mình may đồ chuẩn hơn nhé</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {measurementFields.map((field) => (
                    <div key={field.key}>
                        <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                            {field.label} <span className="text-neutral-500">({field.unit})</span>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={(data as Record<string, number | null>)[field.key] || ''}
                            onChange={(e) => updateField(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder-neutral-500"
                        />
                    </div>
                ))}
            </div>

            <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Ghi chú thêm về dáng người</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Bắp tay hơi to, vai hơi xuôi, thích mặc rộng thoải mái..."
                    rows={3}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder-neutral-500"
                />
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="text-sm">
                    {message && (
                        <span className={`${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {message.text}
                        </span>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-neutral-200 text-neutral-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Đang lưu...' : 'Lưu số đo'}
                </button>
            </div>
        </form>
    );
}
