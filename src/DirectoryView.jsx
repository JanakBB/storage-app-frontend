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
import ConfirmDeleteModal from "./components/ConfirmDeleteModel";

// Import Lucide React icons for Google Drive-like UI
import { 
  HardDrive, 
  Upload, 
  Folder, 
  FileText, 
  Image, 
  Film, 
  Archive, 
  Code, 
  File,
  Grid3X3,
  List,
  Settings,
  HelpCircle
} from "lucide-react";

function DirectoryView() {
  const { dirId } = useParams();
  const navigate = useNavigate();

  const [directoryName, setDirectoryName] = useState("My Drive");
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [newDirname, setNewDirname] = useState("New Folder");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameType, setRenameType] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const fileInputRef = useRef(null);

  // Single-file upload state
  const [uploadItem, setUploadItem] = useState(null);
  const xhrRef = useRef(null);

  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  
  // New state for Google Drive features
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 1073741824 }); // 1GB default

  const openDetailsPopup = (item) => setDetailsItem(item);
  const closeDetailsPopup = () => setDetailsItem(null);

  const loadDirectory = async () => {
    try {
      const data = await getDirectoryItems(dirId);
      setDirectoryName(dirId ? data.name : "My Drive");
      setDirectoriesList([...data.directories].reverse());
      setFilesList([...data.files].reverse());
      
      // Calculate storage usage (you might want to get this from your API)
      const totalSize = [...data.files].reduce((sum, file) => sum + (file.size || 0), 0);
      setStorageUsage(prev => ({ ...prev, used: totalSize }));
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

  // Enhanced file icon function with Lucide icons
  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    const iconProps = { size: 20, className: "text-blue-500" };
    
    switch (ext) {
      case "pdf":
        return <FileText {...iconProps} />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return <Image {...iconProps} className="text-green-500" />;
      case "mp4":
      case "mov":
      case "avi":
      case "mkv":
        return <Film {...iconProps} className="text-purple-500" />;
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return <Archive {...iconProps} className="text-yellow-500" />;
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
        return <Code {...iconProps} className="text-red-500" />;
      default:
        return <File {...iconProps} />;
    }
  }

  function getFolderIcon() {
    return <Folder size={20} className="text-yellow-500" />;
  }

  function handleRowClick(type, id, event) {
    // If shift key is pressed for multi-select
    if (event.shiftKey) {
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
    const allIds = [...directoriesList.map(d => d.id), ...filesList.map(f => f.id)];
    if (selectedItems.size === allIds.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allIds));
    }
  };

  // Upload progress component
  const UploadProgress = () => {
    if (!uploadItem) return null;
    
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-64">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium truncate flex-1 mr-2">
            {uploadItem.name}
          </span>
          <button 
            onClick={() => handleCancelUpload(uploadItem.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadItem.progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.round(uploadItem.progress)}% uploaded
        </div>
      </div>
    );
  };

  // Storage usage component
  const StorageUsage = () => {
    const usedGB = (storageUsage.used / 1024 / 1024 / 1024).toFixed(2);
    const totalGB = (storageUsage.total / 1024 / 1024 / 1024).toFixed(0);
    const percentage = (storageUsage.used / storageUsage.total) * 100;
    
    return (
      <div className="px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
          <span>{usedGB} GB of {totalGB} GB used</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
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

      // Optimistically show the file in the list
      setFilesList((prev) => [tempItem, ...prev]);
      setUploadItem(tempItem);
      e.target.value = "";

      startUpload({ item: tempItem, uploadUrl: uploadSignedUrl, fileId });
    } catch (err) {
      setErrorMessage(err.response.data.error);
      setTimeout(() => setErrorMessage(""), 3000);
      console.log(err);
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
        setErrorMessage("File not uploaded!");
        setTimeout(() => setErrorMessage(""), 3000);
      }
      setUploadItem(null);
      loadDirectory();
    };

    xhr.onerror = (error) => {
      setErrorMessage("Something went wrong during the upload!");
      console.log(error.message);
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

  async function confirmDelete(item) {
    try {
      if (item.isDirectory) await deleteDirectory(item.id);
      else await deleteFile(item.id);
      setDeleteItem(null);
      setSelectedItems(new Set());
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
    }
  }

  async function handleCreateDirectory(e) {
    e.preventDefault();
    try {
      await createDirectory(dirId, newDirname);
      setNewDirname("New Folder");
      setShowCreateDirModal(false);
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
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
      loadDirectory();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || err.message);
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
        getFolderIcon,
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
        {/* Main Content Area */}
        <div className="flex">
          {/* Sidebar - You might want to extract this to a separate component */}
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen hidden md:block">
            <div className="p-4">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 mb-6 hover:bg-blue-700 transition-colors">
                <Upload size={20} />
                New Upload
              </button>
              
              <nav className="space-y-1">
                {[
                  { icon: HardDrive, label: 'My Drive', active: true },
                  { icon: Folder, label: 'Shared with me' },
                  { icon: FileText, label: 'Recent' },
                  { icon: Image, label: 'Photos' },
                  { icon: Film, label: 'Videos' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href="#"
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      item.active 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } transition-colors`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
            
            <StorageUsage />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">{directoryName}</h2>
                {selectedItems.size > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedItems.size} selected
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid" 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <Grid3X3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list" 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage &&
              errorMessage !==
                "Directory not found or you do not have access to it!" && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}

            {/* Directory Header with improved styling */}
            <div className="bg-white mx-6 mt-6 rounded-lg border border-gray-200">
              <DirectoryHeader
                directoryName={directoryName}
                onCreateFolderClick={() => setShowCreateDirModal(true)}
                onUploadFilesClick={() => fileInputRef.current.click()}
                fileInputRef={fileInputRef}
                handleFileSelect={handleFileSelect}
                disabled={
                  errorMessage ===
                  "Directory not found or you do not have access to it!"
                }
                selectedItems={selectedItems}
                onSelectAll={handleSelectAll}
                allSelected={selectedItems.size === combinedItems.length && combinedItems.length > 0}
              />

              {/* Content Area */}
              {combinedItems.length === 0 ? (
                errorMessage ===
                "Directory not found or you do not have access to it!" ? (
                  <div className="text-center py-16">
                    <Folder size={64} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Directory not found</p>
                    <p className="text-gray-400 text-sm">You might not have access to this directory</p>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Upload size={64} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">This folder is empty</p>
                    <p className="text-gray-400 text-sm mb-6">Upload files or create folders to get started</p>
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upload Files
                    </button>
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
            </div>
          </div>
        </div>

        {/* Modals */}
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

        {deleteItem && (
          <ConfirmDeleteModal
            item={deleteItem}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteItem(null)}
          />
        )}

        {/* Upload Progress */}
        <UploadProgress />
      </div>
    </DirectoryContext.Provider>
  );
}

export default DirectoryView;