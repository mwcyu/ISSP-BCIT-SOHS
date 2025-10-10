import { Shield, Lock, Eye, UserX } from 'lucide-react';

const PrivacyNotice = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">Privacy & Anonymity Protection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <UserX className="w-4 h-4 text-blue-600" />
              <span>No names or personal information collected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Anonymous session identifiers only</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Focus on clinical behaviors and skills</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Educational purposes only</span>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            This system is designed to protect privacy while providing valuable feedback guidance. 
            All data is anonymized and used solely for educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;
