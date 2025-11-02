import { useDirectoryContext } from "../context/DirectoryContext";
import DirectoryItem from "./DirectoryItem";

function DirectoryList({
  items,
  viewMode = "grid",
  selectedItems,
  onSelectItem,
}) {
  const { progressMap } = useDirectoryContext();

  if (viewMode === "grid") {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {items.map((item) => {
            const uploadProgress = progressMap[item.id] || 0;
            const isSelected = selectedItems?.has(item.id);

            return (
              <DirectoryItem
                key={item.id}
                item={item}
                uploadProgress={uploadProgress}
                viewMode={viewMode}
                isSelected={isSelected}
                onSelect={onSelectItem}
              />
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-2">
              No files or folders
            </div>
            <div className="text-gray-500 text-sm">
              Upload files or create folders to get started
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-6">
      <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-600">
        <div className="col-span-6">Name</div>
        <div className="col-span-3">Size</div>
        <div className="col-span-3">Modified</div>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item) => {
          const uploadProgress = progressMap[item.id] || 0;
          const isSelected = selectedItems?.has(item.id);

          return (
            <DirectoryItem
              key={item.id}
              item={item}
              uploadProgress={uploadProgress}
              viewMode={viewMode}
              isSelected={isSelected}
              onSelect={onSelectItem}
            />
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg mb-2">No files or folders</div>
          <div className="text-gray-500 text-sm">
            Upload files or create folders to get started
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectoryList;
