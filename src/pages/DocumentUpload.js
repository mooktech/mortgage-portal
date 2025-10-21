import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, X, Eye } from 'lucide-react';

const DocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');

  // Simulated AI extraction (replace with real OpenAI API call later)
  const analyzeDocument = async (file) => {
    setAnalyzing(true);
    setError('');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock extracted data - In production, this would come from OpenAI Vision API
    const mockData = {
      documentType: file.name.toLowerCase().includes('payslip') ? 'Payslip' : 'Bank Statement',
      data: file.name.toLowerCase().includes('payslip') ? {
        employeeName: 'John Smith',
        employer: 'Tech Solutions Ltd',
        grossSalary: '£3,750.00',
        netPay: '£2,890.50',
        payPeriod: 'Monthly',
        payDate: '28/09/2024',
        taxCode: '1257L',
        niNumber: 'AB123456C'
      } : {
        accountHolder: 'John Smith',
        accountNumber: '****5678',
        sortCode: '12-34-56',
        statementPeriod: 'Sept 2024',
        openingBalance: '£2,450.00',
        closingBalance: '£3,120.00',
        totalIncome: '£3,750.00',
        largestExpense: '£850.00 (Rent)',
        averageMonthlyIncome: '£3,680.00'
      }
    };

    setExtractedData(mockData);
    setAnalyzing(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (JPG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setExtractedData(null);
    setError('');
  };

  const startAnalysis = () => {
    if (selectedFile) {
      analyzeDocument(selectedFile);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setError('');
    setAnalyzing(false);
  };

  const confirmData = () => {
    // Here you would save to Firebase/database
    alert('Data confirmed and saved to your profile!');
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Document Analysis</h1>
          <p className="text-xl text-gray-600">Upload your documents and let AI extract the data automatically</p>
        </div>

        {/* Upload Area */}
        {!selectedFile && !extractedData && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div
              className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="text-blue-600" size={40} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Drop your document here</h3>
              <p className="text-gray-600 mb-6">or click to browse</p>

              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInput}
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold cursor-pointer hover:shadow-lg transition-all"
              >
                Choose File
              </label>

              <p className="text-sm text-gray-500 mt-4">
                Supported: PDF, JPG, PNG • Max size: 10MB
              </p>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Document Types */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">📄 Payslips</h4>
                <p className="text-sm text-gray-600">Upload your latest payslip and we'll extract salary, employer, and tax information</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">🏦 Bank Statements</h4>
                <p className="text-sm text-gray-600">Upload bank statements and we'll analyze income, spending patterns, and balances</p>
              </div>
            </div>
          </div>
        )}

        {/* File Selected - Ready to Analyze */}
        {selectedFile && !analyzing && !extractedData && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-blue-600" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedFile.name}</h3>
                  <p className="text-sm text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">🤖 Ready to analyze</h4>
              <p className="text-sm text-gray-600 mb-4">
                Our AI will read your document and automatically extract all relevant information. This usually takes 3-5 seconds.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startAnalysis}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Analyze Document with AI
              </button>
              <button
                onClick={reset}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Analyzing */}
        {analyzing && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Loader className="text-blue-600 animate-spin" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Document...</h3>
            <p className="text-gray-600 mb-6">Our AI is reading your document and extracting data</p>
            <div className="max-w-md mx-auto">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {extractedData && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Analysis Complete!</h3>
                  <p className="text-gray-600">We've extracted the following data from your {extractedData.documentType}</p>
                </div>
              </div>
            </div>

            {/* Extracted Data */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6">Extracted Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(extractedData.data).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✨ <strong>Pro tip:</strong> Review the extracted data and confirm if everything looks correct. You can always edit any field before saving.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h4 className="text-lg font-bold text-gray-900 mb-4">What would you like to do?</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={confirmData}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Confirm & Save Data
                </button>
                <button
                  onClick={reset}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Upload Another Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">How Our AI Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl mb-2">📤</div>
              <h4 className="font-semibold mb-2">1. Upload</h4>
              <p className="text-blue-100 text-sm">Drag and drop your document or click to browse</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🤖</div>
              <h4 className="font-semibold mb-2">2. AI Analysis</h4>
              <p className="text-blue-100 text-sm">Our AI reads and extracts all relevant data automatically</p>
            </div>
            <div>
              <div className="text-4xl mb-2">✅</div>
              <h4 className="font-semibold mb-2">3. Review & Save</h4>
              <p className="text-blue-100 text-sm">Check the data and save it to your profile</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentUpload;