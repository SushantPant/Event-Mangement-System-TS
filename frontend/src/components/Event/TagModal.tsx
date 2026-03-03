import { useState } from "react";
import type { Tag } from "../../interfaces/events.interface";
import { createTag, updateTag, deleteTag } from "../../api/eventsApi";
import toast from "react-hot-toast";
import ConfirmModal from "../ui/ConfirmModal";
import CancelButton from "../ui/CancelButton";
import SubmitButton from "../ui/SubmitButton";


interface TagModalProps {
    isOpen: boolean;
    onClose: () => void;
    tags: Tag[];
    onTagsChanged: () => void;
}

const TagModal = ({ isOpen, onClose, tags, onTagsChanged }: TagModalProps) => {
    const [newTagName, setNewTagName] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        const trimmed = newTagName.trim();
        if (!trimmed) return;
        setLoading(true);
        const res = await createTag(trimmed);
        if (res.success) {
            toast.success(`Tag "${trimmed}" created`);
            setNewTagName("");
            onTagsChanged();
        } else {
            toast.error(res.message || "Failed to create tag");
        }
        setLoading(false);
    };

    const startEdit = (tag: Tag) => {
        setEditingId(tag.id);
        setEditingName(tag.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleUpdate = async () => {
        if (editingId === null) return;
        const trimmed = editingName.trim();
        if (!trimmed) return;
        setLoading(true);
        const res = await updateTag(editingId, trimmed);
        if (res.success) {
            toast.success(`Tag renamed to "${trimmed}"`);
            cancelEdit();
            onTagsChanged();
        } else {
            toast.error(res.message || "Failed to update tag");
        }
        setLoading(false);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingTag) return;
        setLoading(true);
        const res = await deleteTag(deletingTag.id);
        if (res.success) {
            toast.success("Tag deleted");
            setDeletingTag(null);
            onTagsChanged();
        } else {
            toast.error(res.message || "Failed to delete tag");
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
                    <div>
                        <h2 className="text-xl font-black text-stone-900">Manage Tags</h2>
                        <p className="text-xs text-stone-400 mt-0.5">
                            Create, rename, or delete event tags
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="px-6 pt-5 pb-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                        New Tag
                    </label>
                    <div className="flex gap-2">
                        <input
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            placeholder="Enter tag name..."
                            className="flex-1 px-4 py-2.5 rounded-lg text-sm text-stone-800 placeholder-stone-400 bg-stone-100 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-600 transition"
                            disabled={loading}
                        />
                        <SubmitButton
                            type="button"
                            onClick={handleCreate}
                            isLoading={loading}
                            disabled={!newTagName.trim()}
                            className="px-4"
                        >
                            Add
                        </SubmitButton>
                    </div>
                </div>

                <div className="px-6 pb-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 mt-2">
                        Existing Tags ({tags.length})
                    </label>
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                        {tags.length === 0 ? (
                            <p className="text-sm text-stone-400 py-4 text-center">
                                No tags yet. Create one above.
                            </p>
                        ) : (
                            tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="group flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition"
                                >
                                    {editingId === tag.id ? (
                                        <>
                                            <input
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleUpdate();
                                                    if (e.key === "Escape") cancelEdit();
                                                }}
                                                className="flex-1 px-3 py-1.5 rounded-lg text-sm text-stone-800 bg-white border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition"
                                                autoFocus
                                                disabled={loading}
                                            />
                                            <button
                                                onClick={handleUpdate}
                                                disabled={loading || !editingName.trim()}
                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-40"
                                                title="Save"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="w-4 h-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m4.5 12.75 6 6 9-13.5"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition"
                                                title="Cancel"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2}
                                                    stroke="currentColor"
                                                    className="w-4 h-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 18 18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                                            <span className="flex-1 text-sm text-stone-700 font-medium">
                                                {tag.name}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEdit(tag)}
                                                    className="p-1.5 rounded-lg text-stone-400 hover:text-yellow-600 hover:bg-yellow-50 transition"
                                                    title="Rename"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="w-3.5 h-3.5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeletingTag(tag)}
                                                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                                                    title="Delete"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                        className="w-3.5 h-3.5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-stone-50 px-6 py-4 flex justify-end border-t border-stone-100">
                    <CancelButton onClick={onClose}>
                        Done
                    </CancelButton>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deletingTag}
                title="Delete Tag"
                message={`Are you sure you want to delete the tag "${deletingTag?.name}"? Events using this tag will be untagged.`}
                confirmLabel="Delete"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeletingTag(null)}
            />
        </div>
    );
};

export default TagModal;
