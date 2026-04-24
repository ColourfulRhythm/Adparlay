import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Eye, EyeOff } from 'lucide-react';

interface FormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  formData: Record<string, any>;
  submittedAt: Date;
  userAgent: string;
  ipAddress: string;
}

interface Form {
  id: string;
  title: string;
  blocks?: Array<{
    title: string;
    questions: Array<{
      id: string;
      label: string;
      type: string;
    }>;
  }>;
}

interface LeadViewerProps {
  responses: FormSubmission[];
  forms: Form[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const LeadViewer: React.FC<LeadViewerProps> = ({
  responses,
  forms,
  isOpen,
  onClose,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showImages, setShowImages] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const currentResponse = responses[currentIndex];

  const getQuestionLabel = (formId: string, questionId: string): string => {
    const form = forms.find(f => f.id === formId);
    if (!form || !form.blocks) return questionId;
    
    for (const block of form.blocks) {
      const question = block.questions?.find(q => q.id === questionId);
      if (question) return question.label;
    }
    return questionId;
  };

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown';
  };

  const isImageFile = (value: any): boolean => {
    if (typeof value === 'object' && value !== null) {
      return value.isFile && value.fileType?.startsWith('image/');
    }
    return false;
  };

  const isVideoFile = (value: any): boolean => {
    if (typeof value === 'object' && value !== null) {
      return value.isFile && value.fileType?.startsWith('video/');
    }
    return false;
  };

  const downloadFile = (value: any) => {
    if (!value || !value.fileData) return;
    
    try {
      // Convert base64 to blob
      const byteCharacters = atob(value.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: value.fileType });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = value.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  const renderFilePreview = (value: any, questionLabel: string) => {
    if (!value || typeof value !== 'object') return null;

    if (isImageFile(value)) {
      return (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              📷 {value.fileName} ({Math.round(value.fileSize / 1024)}KB)
            </div>
            <button
              onClick={() => downloadFile(value)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Download
            </button>
          </div>
          {showImages && value.fileData && (
            <div className="bg-gray-100 rounded-lg p-2 text-center">
              <img
                src={`data:${value.fileType};base64,${value.fileData}`}
                alt={value.fileName}
                className="max-w-full h-auto max-h-48 rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
              <div className="text-gray-500 text-sm hidden">
                Image preview not available
              </div>
            </div>
          )}
          {!value.fileData && (
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">
                Image data not available for preview
              </div>
              <div className="text-xs text-gray-400 mt-1">
                File: {value.fileName}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isVideoFile(value)) {
      return (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              🎥 {value.fileName} ({Math.round(value.fileSize / 1024)}KB)
            </div>
            <button
              onClick={() => downloadFile(value)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Download
            </button>
          </div>
          {showImages && value.fileData && (
            <div className="bg-gray-100 rounded-lg p-2 text-center">
              <video
                src={`data:${value.fileType};base64,${value.fileData}`}
                controls
                className="max-w-full h-auto max-h-48 rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
              <div className="text-gray-500 text-sm hidden">
                Video preview not available
              </div>
            </div>
          )}
          {!value.fileData && (
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="text-gray-500 text-sm">
                Video data not available for preview
              </div>
              <div className="text-xs text-gray-400 mt-1">
                File: {value.fileName}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (value.isFile) {
      return (
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              📎 {value.fileName} ({Math.round(value.fileSize / 1024)}KB)
            </div>
            <button
              onClick={() => downloadFile(value)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < responses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const downloadCurrentLead = () => {
    if (!currentResponse) return;

    const leadData = {
      'Form Title': currentResponse.formTitle,
      'Submitted Date': currentResponse.submittedAt.toLocaleDateString(),
      'Submitted Time': currentResponse.submittedAt.toLocaleTimeString(),
      'Device': getDeviceInfo(currentResponse.userAgent),
      'IP Address': currentResponse.ipAddress,
      ...Object.fromEntries(
        Object.entries(currentResponse.formData).map(([key, value]) => [
          getQuestionLabel(currentResponse.formId, key),
          typeof value === 'object' && value?.isFile 
            ? `${value.fileName} (${value.fileType})`
            : typeof value === 'string' ? value : JSON.stringify(value)
        ])
      )
    };

    const csvContent = [
      Object.keys(leadData).join(','),
      Object.values(leadData).map(value => 
        typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value
      ).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-${currentResponse.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !currentResponse) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 font-['Epilogue']"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        className="bg-white rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.12)] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-2xl font-black font-['Outfit'] text-gray-900 tracking-tight">
                Lead Insight
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] font-black uppercase tracking-widest">
                  #{currentIndex + 1} of {responses.length}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImages(!showImages)}
              className={`p-2.5 rounded-xl transition-all border ${
                showImages 
                  ? 'bg-purple-50 border-purple-100 text-purple-600' 
                  : 'bg-white border-gray-100 text-gray-400'
              }`}
              title={showImages ? 'Hide Visuals' : 'Show Visuals'}
            >
              {showImages ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              onClick={downloadCurrentLead}
              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all border border-gray-100"
              title="Download Data"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-gray-100 mx-2" />
            <button
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-[#fafafa]">
          <div className="max-w-4xl mx-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentResponse.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-10"
              >
                {/* Meta Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Origin', value: currentResponse.formTitle, icon: <Globe className="w-4 h-4" /> },
                    { label: 'Timestamp', value: `${currentResponse.submittedAt.toLocaleDateString()} at ${currentResponse.submittedAt.toLocaleTimeString()}`, icon: <Clock className="w-4 h-4" /> },
                    { label: 'Platform', value: getDeviceInfo(currentResponse.userAgent), icon: <Eye className="w-4 h-4" /> }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        {stat.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <div className="font-bold text-gray-900 truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Responses Grid */}
                <div>
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 pl-1">Data Flow</h3>
                  {(() => {
                    const form = forms.find(f => f.id === currentResponse.formId);
                    const entries = form && form.blocks 
                      ? form.blocks.flatMap(b => b.questions || []).filter(q => currentResponse.formData[q.id] !== undefined)
                      : Object.entries(currentResponse.formData).map(([id]) => ({ id, label: getQuestionLabel(currentResponse.formId, id), type: 'unknown' }));

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {entries.map((q, index) => {
                          const value = currentResponse.formData[q.id];
                          return (
                            <div key={q.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                  {index + 1}
                                </span>
                                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest truncate">{q.label}</div>
                              </div>
                              <div className="text-gray-900">
                                {typeof value === 'object' && value !== null ? (
                                  <div className="mt-2">
                                    {isImageFile(value) ? (
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                              <Download className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 truncate max-w-[120px]">{value.fileName}</span>
                                          </div>
                                          <button 
                                            onClick={() => downloadFile(value)}
                                            className="text-[10px] font-black uppercase text-purple-600 hover:text-purple-700"
                                          >
                                            Download
                                          </button>
                                        </div>
                                        {showImages && value.fileData && (
                                          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-white">
                                            <img
                                              src={`data:${value.fileType};base64,${value.fileData}`}
                                              alt=""
                                              className="w-full h-auto max-h-64 object-cover"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group-hover:bg-white group-hover:border-purple-100 border border-transparent transition-all">
                                        <div className="flex items-center gap-3">
                                          <FileText className="w-5 h-5 text-gray-400" />
                                          <span className="text-sm font-bold text-gray-700">{value.fileName}</span>
                                        </div>
                                        <button onClick={() => downloadFile(value)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-base font-bold text-gray-800 leading-relaxed break-words pl-1">
                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-8 py-6 border-t border-gray-50 bg-white flex items-center justify-between">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-100 rounded-2xl font-bold text-sm hover:bg-gray-50 disabled:opacity-30 disabled:grayscale transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            {responses.length <= 10 ? (
              responses.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-gray-900 w-6' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))
            ) : (
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">
                Entry {currentIndex + 1} of {responses.length}
              </span>
            )}
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === responses.length - 1}
            className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-30 disabled:grayscale"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LeadViewer;
