import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../../hooks/useDocuments';
import { UploadModal } from '../study/common/UploadModal';
import type { Document } from '../../types/chat';
import DashboardTab from './learning-center/DashboardTab';
import ShelfTab from './learning-center/ShelfTab';
import SettingsTab from './learning-center/SettingsTab';
import DeleteDocumentModal from './learning-center/DeleteDocumentModal';

interface LearningCenterPageProps {
  defaultTab?: 'dashboard' | 'shelf' | 'settings';
}

const LearningCenterPage: React.FC<LearningCenterPageProps> = ({ defaultTab = 'dashboard' }) => {
  const {
    documents,
    isUploading,
    uploadProgress,
    handleFileUpload,
    deleteDocument,
  } = useDocuments(null);

  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const handleStudyClick = (docId: string) => {
    navigate(`/study/${docId}`);
  };

  const readyDocs = documents.filter(d => d.status === 'ready');
  const mainDoc = readyDocs[0];
  const otherDocs = readyDocs.slice(1, 5);

  return (
    <div className="flex-1 h-full bg-[#F5F1E9] text-lab-text overflow-hidden font-rounded relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

      <div className="absolute top-10 right-20 w-32 h-32 border-4 border-lab-accent/10 rounded-full border-dashed animate-[spin_20s_linear_infinite] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-48 h-12 bg-lab-accent2/5 -rotate-3 rounded-full blur-xl pointer-events-none" />

      <div className="h-full overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto p-8 lg:p-16">
          {defaultTab === 'dashboard' ? (
            <DashboardTab
              mainDoc={mainDoc}
              otherDocs={otherDocs}
              onStudy={handleStudyClick}
              onOpenUpload={() => setIsUploadModalOpen(true)}
            />
          ) : defaultTab === 'shelf' ? (
            <ShelfTab
              documents={documents}
              uploadProgress={uploadProgress}
              onStudy={handleStudyClick}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onRequestDelete={setDocToDelete}
            />
          ) : (
            <SettingsTab />
          )}
        </div>
      </div>

      <UploadModal
        documents={documents}
        uploadProgress={uploadProgress}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
        isUploading={isUploading}
      />

      <AnimatePresence>
        {docToDelete && (
          <DeleteDocumentModal
            document={docToDelete}
            onCancel={() => setDocToDelete(null)}
            onConfirm={(docId) => {
              deleteDocument(docId);
              setDocToDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningCenterPage;
