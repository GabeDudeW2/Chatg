import  { Server, Globe, Zap } from 'lucide-react';

export default function CloudflareInfo() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center mb-2">
        <Server className="text-blue-600 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-gray-800">Powered by Cloudflare Workers</h2>
      </div>
      
      <p className="text-gray-600 mb-3 text-sm">
        This chat application uses Cloudflare Workers to provide real-time messaging capabilities. 
        In a production environment, the application would:
      </p>
      
      <div className="space-y-2">
        <div className="flex items-start">
          <Globe className="text-blue-500 mr-2 mt-1 flex-shrink-0" size={16} />
          <span className="text-sm text-gray-700">
            Connect to a distributed global network for low-latency messaging
          </span>
        </div>
        <div className="flex items-start">
          <Zap className="text-blue-500 mr-2 mt-1 flex-shrink-0" size={16} />
          <span className="text-sm text-gray-700">
            Scale automatically to handle thousands of concurrent users
          </span>
        </div>
      </div>
    </div>
  );
}
 
