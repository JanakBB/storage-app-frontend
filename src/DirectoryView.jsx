import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import CreateDirectoryModal from "./components/CreateDirectoryModal";
import RenameModal from "./components/RenameModal";
import DirectoryList from "./components/DirectoryList";
import { DirectoryContext } from "./context/DirectoryContext";

import {
  getDirectoryItems,
  createDirectory,
  deleteDirectory,
  renameDirectory,
} from "./api/directoryApi";

import {
  deleteFile,
  renameFile,
  uploadComplete,
  uploadInitiated,
} from "./api/fileApi";
import DetailsPopup from "./components/DetailsPopup";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import { LogIn } from "lucide-react";

function DirectoryView() {
  const { dirId } = useParams();
  const navigate = useNavigate();

  const [directoryName, setDirectoryName] = useState("My StorageApp");
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // NEW STATES FOR GOOGLE DRIVE FEATURES
  const [viewMode, setViewMode] = useState("grid");
  const [selectedItems, setSelectedItems] = useState(new Set());

  const fileInputRef = useRef(null);

  // Single-file upload state
  const [uploadItem, setUploadItem] = useState(null);
  const xhrRef = useRef(null);

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const openDetailsPopup = (item) => setDetailsItem(item);
  const closeDetailsPopup = () => setDetailsItem(null);

  const loadDirectory = async () => {
    try {
      const data = await getDirectoryItems(dirId);
      setDirectoryName(dirId ? data.name : "My StorageApp");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else setErrorMessage(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    loadDirectory();
    setActiveContextMenu(null);
    setSelectedItems(new Set()); // Clear selection when directory changes
  }, [dirId]);

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return "pdf";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "image";
      case "mp4":
      case "mov":
      case "avi":
        return "video";
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return "archive";
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
        return "code";
      default:
        return "alt";
    }
  }

  // UPDATED handleRowClick to support multi-select
  function handleRowClick(type, id, event) {
    // If shift key is pressed for multi-select
    if (event?.shiftKey) {
      event.preventDefault();
      const newSelected = new Set(selectedItems);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedItems(newSelected);
      return;
    }

    // Normal click behavior
    if (type === "directory") {
      navigate(`/directory/${id}`);
    } else {
      const base = import.meta.env.VITE_BACKEND_BASE_URL.replace(/\/$/, "");
      window.location.href = `${base}/file/${id}`;
    }
  }

  // Selection handlers
  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = [
      ...directoriesList.map((d) => d.id),
      ...filesList.map((f) => f.id),
    ];
    if (selectedItems.size === allIds.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allIds));
    }
  };

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadItem?.isUploading) {
      setErrorMessage("An upload is already in progress. Please wait.");
      setTimeout(() => setErrorMessage(""), 3000);
      e.target.value = "";
      return;
    }

    const tempItem = {
      file,
      name: file.name,
      size: file.size,
      id: `temp-${Date.now()}`,
      isUploading: true,
      progress: 0,
    };

    try {
      const data = await uploadInitiated({
        name: file.name,
        size: file.size,
        contentType: file.type,
        parentDirId: dirId,
      });

      const { uploadSignedUrl, fileId } = data;

      setFilesList((prev) => [tempItem, ...prev]);
      setUploadItem(tempItem);
      e.target.value = "";

      startUpload({ item: tempItem, uploadUrl: uploadSignedUrl, fileId });
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Upload failed");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  }

  function startUpload({ item, uploadUrl, fileId }) {
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.open("PUT", uploadUrl);

    xhr.upload.addEventListener("progress", (evt) => {
      if (evt.lengthComputable) {
        const progress = (evt.loaded / evt.total) * 100;
        setUploadItem((prev) => (prev ? { ...prev, progress } : prev));
      }
    });

    xhr.onload = async () => {
      if (xhr.status === 200) {
        await uploadComplete(fileId);
      } else {
        setErrorMessage("File upload failed!");
        setTimeout(() => setErrorMessage(""), 3000);
      }
      setUploadItem(null);
      loadDirectory();
    };

    xhr.onerror = (error) => {
      setErrorMessage("Upload failed. Please try again.");
      setFilesList((prev) => prev.filter((f) => f.id !== item.id));
      setUploadItem(null);
      setTimeout(() => setErrorMessage(""), 3000);
    };

    xhr.send(item.file);
  }

  function handleCancelUpload(tempId) {
    if (uploadItem && uploadItem.id === tempId && xhrRef.current) {
      xhrRef.current.abort();
    }
    setFilesList((prev) => prev.filter((f) => f.id !== tempId));
    setUploadItem(null);
  }

  // ENHANCED: Better delete function with detailed folder error handling
  async function confirmDelete(item) {
    console.log("🔄 Starting delete process for:", item);

    try {
      if (item.isDirectory) {
        console.log("🗂️ Deleting directory:", item.id, item.name);
        await deleteDirectory(item.id);
        console.log("✅ Directory deleted successfully");
      } else {
        console.log("📄 Deleting file:", item.id, item.name);
        await deleteFile(item.id);
        console.log("✅ File deleted successfully");
      }

      setDeleteItem(null);
      setSelectedItems(new Set());
      console.log("🔄 Refreshing directory...");
      await loadDirectory();
      console.log("✅ Directory refreshed after delete");
    } catch (err) {
      console.error("❌ Delete error:", err);

      // ENHANCED ERROR HANDLING FOR FOLDERS
      let errorMsg =
        err.response?.data?.error ||
        err.message ||
        "Delete failed. Please try again.";

      // Check if it's a "folder not empty" error
      const errorLower = errorMsg.toLowerCase();
      if (
        errorLower.includes("empty") ||
        errorLower.includes("not empty") ||
        errorLower.includes("contains files") ||
        errorLower.includes("non-empty") ||
        err.response?.status === 409 || // 409 Conflict often used for this
        err.response?.status === 423
      ) {
        // 423 Locked
        errorMsg =
          "Cannot delete folder: The folder is not empty. Please delete all files and subfolders first before deleting the folder.";
      }

      // Check for permission errors
      if (
        errorLower.includes("permission") ||
        errorLower.includes("access denied")
      ) {
        errorMsg = "You don't have permission to delete this item.";
      }

      setErrorMessage(errorMsg);
      setDeleteItem(null);

      // Show error for longer so you can read it
      setTimeout(() => setErrorMessage(""), 8000);
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    try {
      await createDirectory(dirId, newDirname);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      await loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to create folder");
    }
  }

  function openRenameModal(type, id, currentName) {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    try {
      if (renameType === "file") await renameFile(renameId, renameValue);
      else await renameDirectory(renameId, renameValue);

      setShowRenameModal(false);
      setRenameValue("");
      setRenameType(null);
      setRenameId(null);
      await loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Rename failed");
    }
  }

  useEffect(() => {
    const handleDocumentClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const combinedItems = [
    ...directoriesList.map((d) => ({ ...d, isDirectory: true })),
    ...filesList.map((f) => ({ ...f, isDirectory: false })),
  ];

  const isUploading = !!uploadItem?.isUploading;
  const progressMap = uploadItem
    ? { [uploadItem.id]: uploadItem.progress || 0 }
    : {};

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <DirectoryContext.Provider
      value={{
        handleRowClick,
        activeContextMenu,
        handleContextMenu: (e, id) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveContextMenu((prev) => (prev === id ? null : id));
        },
        getFileIcon,
        isUploading,
        progressMap,
        handleCancelUpload,
        setDeleteItem,
        openRenameModal,
        openDetailsPopup,
        viewMode,
        setViewMode,
        selectedItems,
        handleSelectItem,
        handleSelectAll,
      }}
    >
      <div className="min-h-screen bg-gray-50">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mx-4 mt-4 lg:mx-6 lg:mt-6">
            <strong>Error:</strong> {errorMessage}{" "}
            <button
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={handleLoginRedirect}
            >
              <LogIn size={16} />
              Sign in
            </button>
          </div>
        )}

        <DirectoryHeader
          directoryName={directoryName}
          onCreateFolderClick={() => setShowCreateDirModal(true)}
          onUploadFilesClick={() => fileInputRef.current.click()}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          disabled={errorMessage?.includes("not found")}
          selectedItems={selectedItems}
          onSelectAll={handleSelectAll}
          allSelected={
            selectedItems.size === combinedItems.length &&
            combinedItems.length > 0
          }
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {showCreateDirModal && (
          <CreateDirectoryModal
            newDirname={newDirname}
            setNewDirname={setNewDirname}
            onClose={() => setShowCreateDirModal(false)}
            onCreateDirectory={handleCreateDirectory}
          />
        )}

        {showRenameModal && (
          <RenameModal
            renameType={renameType}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            onClose={() => setShowRenameModal(false)}
            onRenameSubmit={handleRenameSubmit}
          />
        )}

        {detailsItem && (
          <DetailsPopup item={detailsItem} onClose={closeDetailsPopup} />
        )}

        {combinedItems.length === 0 ? (
          errorMessage?.includes("not found") ? (
            <div className="text-center py-16 mx-4 lg:mx-6">
              <div className="text-gray-400 text-lg mb-2">
                Directory not found
              </div>
              <div className="text-gray-500 text-sm">
                You might not have access to this directory
              </div>
            </div>
          ) : (
            <div className="text-center py-16 mx-4 lg:mx-6">
              <div className="text-gray-400 text-lg mb-2">
                This folder is empty
              </div>
              <div className="text-gray-500 text-sm">
                Upload files or create folders to get started
              </div>
            </div>
          )
        ) : (
          <DirectoryList
            items={combinedItems}
            viewMode={viewMode}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
          />
        )}

        {deleteItem && (
          <ConfirmDeleteModal
            item={deleteItem}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteItem(null)}
          />
        )}
      </div>
    </DirectoryContext.Provider>
  );
}

export default DirectoryView;
