'use client';

import { useState } from 'react';
import { Plus, GripVertical, Edit2, Trash2, ChevronRight, FolderOpen } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Category {
    id: string;
    name: string;
    nameVi?: string;
    slug: string;
    image?: string;
    parentId?: string | null;
    sortOrder: number;
    isActive: boolean;
    children: Category[];
    _count?: { products: number };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        nameVi: '',
        description: '',
        parentId: '',
        image: '',
    });

    // Load categories
    useState(() => {
        fetch('/api/admin/categories')
            .then((res) => res.json())
            .then((data) => {
                setCategories(data.categories || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    });

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const method = editingCategory ? 'PUT' : 'POST';
        const body = editingCategory
            ? { id: editingCategory.id, ...formData }
            : formData;

        try {
            const res = await fetch('/api/admin/categories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                // Reload categories
                const data = await fetch('/api/admin/categories').then((r) => r.json());
                setCategories(data.categories || []);
                setShowForm(false);
                setEditingCategory(null);
                setFormData({ name: '', nameVi: '', description: '', parentId: '', image: '' });
            }
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;

        try {
            const res = await fetch(`/api/admin/categories?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                const data = await fetch('/api/admin/categories').then((r) => r.json());
                setCategories(data.categories || []);
            } else {
                const error = await res.json();
                alert(error.error || 'Không thể xóa danh mục');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const startEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            nameVi: category.nameVi || '',
            description: '',
            parentId: category.parentId || '',
            image: category.image || '',
        });
        setShowForm(true);
    };

    const renderCategory = (category: Category, level: number = 0) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedIds.has(category.id);

        return (
            <div key={category.id}>
                <div
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors ${level > 0 ? 'ml-8' : ''
                        }`}
                >
                    <GripVertical className="w-4 h-4 text-neutral-600 cursor-grab" />

                    {hasChildren ? (
                        <button
                            onClick={() => toggleExpand(category.id)}
                            className="p-1 hover:bg-neutral-700 rounded"
                        >
                            <ChevronRight
                                className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''
                                    }`}
                            />
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}

                    <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                        {category.image ? (
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <FolderOpen className="w-5 h-5 text-neutral-500" />
                        )}
                    </div>

                    <div className="flex-1">
                        <p className="text-white font-medium">{category.name}</p>
                        {category.nameVi && (
                            <p className="text-sm text-neutral-500">{category.nameVi}</p>
                        )}
                    </div>

                    <span className="text-sm text-neutral-500">
                        {category._count?.products || 0} sản phẩm
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => startEdit(category)}
                            className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 hover:bg-red-900/50 rounded-lg text-neutral-400 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="border-l border-neutral-800 ml-6">
                        {category.children.map((child) => renderCategory(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-neutral-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Danh mục</h1>
                    <p className="text-neutral-400 text-sm mt-1">Quản lý danh mục sản phẩm</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', nameVi: '', description: '', parentId: '', image: '' });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Thêm danh mục
                </button>
            </div>

            {/* Category Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-lg font-medium text-white mb-4">
                            {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Tên danh mục *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    placeholder="VD: Áo dài cưới"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Tên tiếng Việt</label>
                                <input
                                    type="text"
                                    value={formData.nameVi}
                                    onChange={(e) => setFormData({ ...formData, nameVi: e.target.value })}
                                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    placeholder="VD: Áo dài cưới truyền thống"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Hình ảnh</label>
                                <ImageUpload
                                    value={formData.image ? [formData.image] : []}
                                    onChange={(urls) => setFormData({ ...formData, image: urls[0] || '' })}
                                    maxFiles={1}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Danh mục cha</label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                >
                                    <option value="">Không có (danh mục gốc)</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors"
                                >
                                    {editingCategory ? 'Cập nhật' : 'Thêm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                {categories.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500">
                        Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-800">
                        {categories.map((category) => renderCategory(category))}
                    </div>
                )}
            </div>
        </div>
    );
}
