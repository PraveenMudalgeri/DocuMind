import React from 'react';

export function DocumentDescriptionModal({ open, onClose, document }) {
  if (!open || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{document.title || 'Untitled Document'}</h2>
        <p className="text-gray-700 mb-4">{document.description || 'No description provided.'}</p>
        <div className="text-xs text-gray-500">
          <div><b>Filename:</b> {document.filename}</div>
          <div><b>Uploaded:</b> {document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : 'Unknown'}</div>
        </div>
      </div>
    </div>
  );
}
