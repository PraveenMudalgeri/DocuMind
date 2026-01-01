import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Container } from '../components/layout/Container';
import { DocumentList } from '../components/documents/DocumentList';
import { Button } from '../components/common/Button';
import { documentService } from '../services/documentService';
import { ROUTES } from '../utils/constants';

export function DocumentsListPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen-safe flex flex-col bg-white md:bg-gray-50 overflow-hidden">
      <div className="shrink-0">
        <Header />
      </div>
      <div className="flex-1 overflow-y-auto">
        <Container maxWidth="xl" className="py-6 md:py-12 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">My Documents</h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">View all your indexed documents</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {documents.length > 0 && (
                <Button
                  variant={isSelectionMode ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`flex-1 sm:flex-none border transition-all ${isSelectionMode ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300' : 'border-gray-200'}`}
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                  }}
                >
                  {isSelectionMode ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={() => navigate(ROUTES.DOCUMENTS)}
                size="sm"
                className="flex-1 sm:flex-none shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload New
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {documents.length > 0 && (
                <div className="mb-4 md:mb-6 flex items-center gap-4">
                  <div className="bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-xs md:text-sm text-gray-600 font-medium">
                        <span className="font-bold text-gray-900">{documents.length}</span> {documents.length !== 1 ? 'Documents' : 'Document'} indexed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <DocumentList
                documents={documents}
                onDocumentsChanged={() => {
                  setIsSelectionMode(false);
                  loadDocuments();
                }}
                isSelectionMode={isSelectionMode}
                onSelectionChange={setSelectedCount}
              />
            </>
          )}
        </Container>
      </div>
    </div>
  );
}
