import { useState } from "react";

function ConfirmDeleteModal({ item, onConfirm, onCancel }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!item) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(item);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
        <p className="text-sm mb-6">
          Are you sure you want to delete <strong>"{item.name}"</strong>?
          {item.isDirectory && (
            <span className="block mt-2 text-red-600 font-medium">
              ⚠️ This folder and ALL its contents will be permanently deleted!
            </span>
          )}
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 transition-colors"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
