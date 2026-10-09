import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import DataTable, { type Column } from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Modal from '../../components/admin/Modal';
import { MOCK_ADMIN_CATEGORIES } from '../../data/mockCategories';
import type { AdminCategory } from '../../types/admin';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>(MOCK_ADMIN_CATEGORIES);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Dialog
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormTags('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: AdminCategory) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormDescription(c.description);
    setFormTags(c.tags.join(', '));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    const tagList = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingCategory) {
      // Edit
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName.trim(),
                slug: formSlug.trim() || c.slug,
                description: formDescription.trim(),
                tags: tagList,
              }
            : c
        )
      );
      showToast(`แก้ไขหมวดหมู่ "${formName}" เรียบร้อยแล้ว`);
    } else {
      // Add new
      const newCat: AdminCategory = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        slug:
          formSlug.trim() ||
          formName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, ''),
        description: formDescription.trim(),
        bookCount: 0,
        tags: tagList,
      };
      setCategories((prev) => [...prev, newCat]);
      showToast(`เพิ่มหมวดหมู่ใหม่ "${formName}" เรียบร้อยแล้ว`);
    }

    setIsModalOpen(false);
  };

  const handleInitiateDelete = (c: AdminCategory) => {
    if (c.bookCount > 0) {
      showToast(`ไม่สามารถลบหมวดหมู่ "${c.name}" ได้เนื่องจากยังมีหนังสืออยู่ในหมวดหมู่นี้ (${c.bookCount} เล่ม)`);
      return;
    }
    setCategoryToDelete(c);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    showToast(`ลบหมวดหมู่ "${categoryToDelete.name}" เรียบร้อยแล้ว`);
    setIsDeleteOpen(false);
    setCategoryToDelete(null);
  };

  const columns: Column<AdminCategory>[] = [
    {
      key: 'name',
      header: 'ชื่อหมวดหมู่',
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-medium text-text-main hover:text-accent cursor-pointer" onClick={() => handleOpenEdit(c)}>
            {c.name}
          </span>
          <p className="text-xs text-text-main/50 line-clamp-1 mt-0.5">{c.description}</p>
        </div>
      ),
    },
    {
      key: 'bookCount',
      header: 'จำนวนหนังสือ',
      sortable: true,
      render: (c) => (
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-bg-secondary text-text-main/80 border border-border-main">
          {c.bookCount} เล่ม
        </span>
      ),
    },
    {
      key: 'tags',
      header: 'แท็กที่เชื่อมโยง',
      render: (c) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {c.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded border border-border-main bg-bg-secondary/40 text-text-main/60"
            >
              #{t}
            </span>
          ))}
          {c.tags.length > 3 && (
            <span className="text-[10px] text-text-main/40">+{c.tags.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'การจัดการ',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(c)}
            title="แก้ไขหมวดหมู่"
            className="p-1 text-text-main/60 hover:text-accent hover:bg-bg-secondary rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleInitiateDelete(c)}
            title={
              c.bookCount > 0
                ? `ไม่สามารถลบได้ (ยังมีหนังสือ ${c.bookCount} เล่ม)`
                : 'ลบหมวดหมู่'
            }
            className={`p-1 rounded transition-colors ${
              c.bookCount > 0
                ? 'text-text-main/20 hover:text-text-main/40 cursor-not-allowed'
                : 'text-warning hover:bg-warning/10'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-text-main text-bg-main px-4 py-3 rounded-md shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-medium text-text-main">
            จัดการหมวดหมู่หนังสือ ({categories.length})
          </h2>
          <p className="text-xs text-text-main/60 mt-0.5">
            กำหนดหมวดหมู่และแท็กสำหรับระบบคัดกรองในหน้าค้นหาหนังสือและหน้าลงรายการ
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-accent text-bg-main rounded-md text-xs font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={categories}
        keyExtractor={(c) => c.id}
        searchPlaceholder="ค้นหาชื่อหมวดหมู่, แท็ก..."
        itemsPerPage={10}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? `แก้ไขหมวดหมู่: ${editingCategory.name}` : 'เพิ่มหมวดหมู่หนังสือใหม่'}
        subtitle="หมวดหมู่นี้จะปรากฏในตัวกรองหน้าค้นหาและตัวเลือกหน้าลงรายการหนังสือ"
      >
        <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 rounded bg-warning/10 border border-warning/30 text-warning text-xs">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-main/80">
              ชื่อหมวดหมู่ (ภาษาไทย) <span className="text-warning">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="เช่น นิยายวิทยาศาสตร์, วรรณกรรมเยาวชน..."
              className="w-full bg-bg-secondary/40 border border-border-main rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-main/80">
              Slug (URL ภาษาอังกฤษ)
            </label>
            <input
              type="text"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="เช่น sci-fi, young-adult..."
              className="w-full bg-bg-secondary/40 border border-border-main rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-main/80">
              คำอธิบายหมวดหมู่
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="อธิบายลักษณะหรือขอบเขตของหนังสือในหมวดหมู่นี้..."
              className="w-full bg-bg-secondary/40 border border-border-main rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-main/80">
              แท็กค้นหาที่เชื่อมโยง (คั่นด้วยเครื่องหมายจุลภาค ,)
            </label>
            <input
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="เช่น Sci-Fi, Space, Cyberpunk..."
              className="w-full bg-bg-secondary/40 border border-border-main rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-border-main rounded-md text-xs font-medium hover:bg-bg-secondary"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-bg-main rounded-md text-xs font-medium hover:bg-accent/90"
            >
              {editingCategory ? 'บันทึกการแก้ไข' : 'สร้างหมวดหมู่'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`ยืนยันการลบหมวดหมู่ "${categoryToDelete?.name}"`}
        message="การลบหมวดหมู่นี้จะนำหมวดหมู่ออกจากระบบตัวกรอง คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?"
        confirmText="ลบหมวดหมู่"
        variant="danger"
      />
    </div>
  );
}
