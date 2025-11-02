import { useState } from "react";
import {
  Folder,
  FileText,
  Image,
  Film,
  Archive,
  Code,
  File,
  MoreVertical,
  Check,
} from "lucide-react";
import ContextMenu from "./ContextMenu";
import { useDirectoryContext } from "../context/DirectoryContext";
import { formatSize } from "./DetailsPopup";

function DirectoryItem({
  item,
  uploadProgress,
  viewMode = "grid",
  isSelected = false,
  onSelect,
}) {
  const {
    handleRowClick,
    activeContextMenu,
    handleContextMenu,
    getFileIcon,
    isUploading,
  } = useDirectoryContext();

  const [isHovered, setIsHovered] = useState(false);

  function renderFileIcon(iconString, size = 20) {
    const className = "flex-shrink-0";

    switch (iconString) {
      case "pdf":
        return <FileText size={size} className={`${className} text-red-500`} />;
      case "image":
        return <Image size={size} className={`${className} text-green-500`} />;
      case "video":
        return <Film size={size} className={`${className} text-purple-500`} />;
      case "archive":
        return (
          <Archive size={size} className={`${className} text-yellow-500`} />
        );
      case "code":
        return <Code size={size} className={`${className} text-pink-500`} />;
      case "alt":
      default:
        return <File size={size} className={`${className} text-gray-500`} />;
    }
  }

  const isUploadingItem = item.id.startsWith("temp-");
  const modifiedDate = new Date(
    item.updatedAt || item.createdAt
  ).toLocaleDateString();

  // FIXED: Show proper folder info
  const getFolderInfo = () => {
    // If your API provides itemCount for folders, use it
    // Otherwise show generic folder info
    return item.itemCount ? `${item.itemCount} items` : "Folder";
  };

  if (viewMode === "grid") {
    return (
      <div
        className={`relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer group ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-300 hover:shadow-md"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onSelect?.(item.id);
          } else if (!activeContextMenu && !isUploading) {
            handleRowClick(item.isDirectory ? "directory" : "file", item.id, e);
          }
        }}
        onContextMenu={(e) => handleContextMenu(e, item.id)}
      >
        <div
          className={`absolute top-2 left-2 z-10 w-5 h-5 border-2 rounded transition-all duration-200 ${
            isSelected
              ? "bg-blue-500 border-blue-500"
              : isHovered
              ? "border-gray-400 bg-white"
              : "border-gray-300 bg-white opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(item.id);
          }}
        >
          {isSelected && <Check size={12} className="text-white" />}
        </div>

        <button
          className={`absolute top-2 right-2 z-10 p-1 rounded-full transition-all duration-200 ${
            isHovered || activeContextMenu === item.id
              ? "opacity-100 bg-white shadow-sm"
              : "opacity-0"
          } hover:bg-gray-100`}
          onClick={(e) => {
            e.stopPropagation();
            handleContextMenu(e, item.id);
          }}
        >
          <MoreVertical size={14} className="text-gray-600" />
        </button>

        <div className="p-4">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
              {item.isDirectory ? (
                <Folder size={32} className="text-blue-500" />
              ) : (
                renderFileIcon(getFileIcon(item.name), 32)
              )}
            </div>
          </div>

          <h3 className="font-medium text-sm text-gray-900 text-center mb-2 line-clamp-2 leading-tight">
            {item.name}
          </h3>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <div>{modifiedDate}</div>
            {/* FIXED: Show proper info for folders vs files */}
            {item.isDirectory ? (
              <div>{getFolderInfo()}</div>
            ) : (
              <div>{formatSize(item.size)}</div>
            )}
          </div>

          {isUploadingItem && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundColor:
                      uploadProgress === 100 ? "#10b981" : "#3b82f6",
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                {Math.floor(uploadProgress)}%
              </div>
            </div>
          )}
        </div>

        {activeContextMenu === item.id && (
          <div className="absolute top-10 right-2 z-20">
            <ContextMenu item={item} isUploadingItem={isUploadingItem} />
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div
      className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors cursor-pointer group ${
        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onSelect?.(item.id);
        } else if (!activeContextMenu && !isUploading) {
          handleRowClick(item.isDirectory ? "directory" : "file", item.id, e);
        }
      }}
      onContextMenu={(e) => handleContextMenu(e, item.id)}
    >
      <div className="col-span-1">
        <div
          className={`w-4 h-4 border-2 rounded transition-all duration-200 flex items-center justify-center ${
            isSelected
              ? "bg-blue-500 border-blue-500"
              : isHovered
              ? "border-gray-400"
              : "border-gray-300 opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(item.id);
          }}
        >
          {isSelected && <Check size={10} className="text-white" />}
        </div>
      </div>

      <div className="col-span-5 flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">
          {item.isDirectory ? (
            <Folder size={20} className="text-blue-500" />
          ) : (
            renderFileIcon(getFileIcon(item.name), 20)
          )}
        </div>
        <span className="text-gray-900 truncate font-medium" title={item.name}>
          {item.name}
        </span>
      </div>

      {/* FIXED: Size column - Show proper info for folders */}
      <div className="col-span-3 text-sm text-gray-600">
        {
          item.isDirectory
            ? getFolderInfo() // Show folder info
            : formatSize(item.size) // Show file size
        }
      </div>

      <div className="col-span-2 text-sm text-gray-600">{modifiedDate}</div>

      <div className="col-span-1 flex justify-end">
        <button
          className={`p-1 rounded transition-opacity duration-200 ${
            isHovered || activeContextMenu === item.id
              ? "opacity-100"
              : "opacity-0"
          } hover:bg-gray-200`}
          onClick={(e) => {
            e.stopPropagation();
            handleContextMenu(e, item.id);
          }}
        >
          <MoreVertical size={16} className="text-gray-600" />
        </button>

        {activeContextMenu === item.id && (
          <div className="absolute right-4 z-10">
            <ContextMenu item={item} isUploadingItem={isUploadingItem} />
          </div>
        )}
      </div>

      {isUploadingItem && (
        <div className="col-span-12 mt-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${uploadProgress}%`,
                  backgroundColor:
                    uploadProgress === 100 ? "#10b981" : "#3b82f6",
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 min-w-8">
              {Math.floor(uploadProgress)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryItem;
