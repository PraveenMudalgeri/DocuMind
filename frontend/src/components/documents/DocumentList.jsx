import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { documentService } from '../../services/documentService';

export function DocumentList({ documents, onDocumentsChanged, isSelectionMode, onSelectionChange }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selected, setSelected] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selected.length);
  }, [selected, onSelectionChange]);

  // Reset selection when exiting selection mode
  useEffect(() => {
    if (!isSelectionMode) {
      setSelected([]);
    }
  }, [isSelectionMode]);

  const handleDocumentClick = (idx) => {
    if (isSelectionMode) {
      handleSelect(documents[idx].filename);
    } else {
      setExpandedIndex(expandedIndex === idx ? null : idx);
    }
  };

  const handleSelect = (filename) => {
    setSelected((prev) => prev.includes(filename)
      ? prev.filter(f => f !== filename)
      : [...prev, filename]);
  };

  const handleSelectAll = () => {
    if (selected.length === documents.length) {
      setSelected([]);
    } else {
      setSelected(documents.map(doc => doc.filename));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await documentService.deleteDocuments(selected);
      setSelected([]);
      setShowConfirm(false);
      onDocumentsChanged?.();
    } catch (e) {
      alert('Failed to delete documents.');
    } finally {
      setDeleting(false);
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
        <p className="text-gray-600">Upload your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isSelectionMode && (
        <div className="sticky top-0 z-10 bg-gray-50 pb-4 flex items-center justify-between border-b border-gray-200 mb-6 bg-opacity-90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              checked={selected.length === documents.length && documents.length > 0}
              onChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-gray-700">
              {selected.length === 0
                ? 'Select documents to delete'
                : `${selected.length} document${selected.length !== 1 ? 's' : ''} selected`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              disabled={selected.length === 0}
              onClick={() => setShowConfirm(true)}
            >
              Delete {selected.length > 0 && `(${selected.length})`}
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {documents.map((doc, index) => {
          const isSelected = selected.includes(doc.filename);
          let description = doc.description;
          if (!description) {
            const autoDescription = doc.preview || doc.content || doc.metadata?.content || '';
            description = autoDescription.length > 0 ? autoDescription.slice(0, 200) + (autoDescription.length > 200 ? '...' : '') : 'No description available.';
          }

          return (
            <Card
              key={index}
              hover
              padding="sm"
              className={`transition-all relative ${isSelected ? 'ring-2 ring-orange-500 border-orange-200 bg-orange-50' : 'cursor-pointer hover:border-orange-200'}`}
              onClick={() => handleDocumentClick(index)}
            >
              <div className="flex items-start gap-4">
                {isSelectionMode && (
                  <div className="pt-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      checked={isSelected}
                      onChange={e => { e.stopPropagation(); handleSelect(doc.filename); }}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                )}
                <div className={`w-10 h-10 md:w-12 md:h-12 ${isSelected ? 'bg-orange-200' : 'bg-orange-100'} rounded-lg flex items-center justify-center flex-shrink-0 transition-colors`}>
                  <svg className={`w-5 h-5 md:w-6 md:h-6 ${isSelected ? 'text-orange-700' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 truncate pr-4">
                      {doc.title || 'Untitled Document'}
                    </h3>
                    {!isSelectionMode && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Indexed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    {doc.filename && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {doc.filename}
                      </span>
                    )}
                    {doc.chunks && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {doc.chunks} chunks
                      </span>
                    )}
                  </div>
                  {(expandedIndex === index || isSelectionMode) && (
                    <div className={`rounded p-3 mt-2 text-sm text-gray-700 transition-colors ${isSelected ? 'bg-orange-100/50' : 'bg-gray-50'}`}>
                      {description}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <Card className="max-w-md w-full" padding="lg">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Documents?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{selected.length}</span> document(s)? This will permanently remove them from your index.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                onClick={handleDelete}
                loading={deleting}
              >
                Delete Forever
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
