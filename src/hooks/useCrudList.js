import { useState, useEffect, useCallback } from 'react';
import { withToast } from '../utils/withToast';

/** Generic CRUD list: fetchAll, create, update, delete, modal state. */
export function useCrudList({ fetchAll, create, update, delete: deleteApi, entityName, deleteConfirmMessage = 'Are you sure?', onSuccess }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const refetch = useCallback(async () => {
    setLoading(true);
    try { const res = await fetchAll(); setItems(res.data || []); } catch { setItems([]); }
    finally { setLoading(false); }
  }, [fetchAll]);
  useEffect(() => { refetch(); }, [refetch]);
  const handleSubmit = useCallback((formData) => {
    const promise = editingItem ? update(editingItem._id, formData) : create(formData);
    withToast(promise, { success: `${entityName} ${editingItem ? 'updated' : 'created'} successfully`, error: 'Operation failed', onSuccess: () => { setShowModal(false); setEditingItem(null); refetch(); onSuccess?.(); } });
  }, [editingItem, create, update, entityName, refetch, onSuccess]);
  const handleDelete = useCallback((id) => {
    if (!window.confirm(deleteConfirmMessage)) return;
    withToast(deleteApi(id), { success: `${entityName} deleted successfully`, error: `Failed to delete ${entityName.toLowerCase()}`, onSuccess: refetch });
  }, [deleteApi, entityName, deleteConfirmMessage, refetch]);
  return { items, loading, refetch, editingItem, setEditingItem, showModal, setShowModal, handleSubmit, handleDelete };
}
