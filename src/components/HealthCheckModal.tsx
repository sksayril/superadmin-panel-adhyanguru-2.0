import { useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Activity, Database, Server, Cpu, HardDrive, Clock } from 'lucide-react';
import { createPortal } from 'react-dom';

interface HealthCheckData {
  success: boolean;
  message: string;
  timestamp: string;
  health: {
    status: 'healthy' | 'warning' | 'unhealthy';
    message: string;
    issues: string[];
  };
  server: {
    status: string;
    platform: string;
    arch: string;
    hostname: string;
    nodeVersion: string;
    uptime: number;
    uptimeFormatted: string;
  };
  database: {
    connected: boolean;
    state: string;
    responseTime: number;
    error: string | null;
    stats?: {
      collections: number;
      dataSize: string;
      storageSize: string;
      indexes: number;
      indexSize: string;
      objects: number;
    };
  };
  memory: {
    process: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
      external: string;
      arrayBuffers: string;
    };
    system: {
      total: string;
      free: string;
      used: string;
      usagePercent: string;
    };
  };
  cpu: {
    cores: number;
    model: string;
    loadAverage: number[];
  };
  performance: {
    apiResponseTime: string;
    databaseResponseTime: string;
  };
}

interface HealthCheckModalProps {
  isOpen: boolean;
  data: HealthCheckData | null;
  loading: boolean;
  onClose: () => void;
}

export default function HealthCheckModal({ isOpen, data, loading, onClose }: HealthCheckModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'unhealthy':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getUsageColor = (percent: string) => {
    const num = parseFloat(percent);
    if (num >= 90) return 'text-red-600';
    if (num >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="health-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 animate-scale-in transform max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="health-modal-title" className="text-2xl font-bold text-gray-800">
                System Health Check
              </h2>
              {data && (
                <p className="text-sm text-gray-500">
                  Last checked: {new Date(data.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
          ) : data ? (
            <>
              {/* Overall Health Status */}
              <div className={`border-2 rounded-xl p-6 ${getStatusColor(data.health.status)}`}>
                <div className="flex items-center gap-3 mb-3">
                  {getStatusIcon(data.health.status)}
                  <h3 className="text-xl font-bold capitalize">{data.health.status}</h3>
                </div>
                <p className="text-sm mb-3">{data.health.message}</p>
                {data.health.issues.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="font-semibold text-sm">Issues Detected:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {data.health.issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Server Information */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Server className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Server</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600 capitalize">{data.server.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform:</span>
                      <span className="font-semibold text-gray-800">{data.server.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Architecture:</span>
                      <span className="font-semibold text-gray-800">{data.server.arch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hostname:</span>
                      <span className="font-semibold text-gray-800">{data.server.hostname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Node Version:</span>
                      <span className="font-semibold text-gray-800">{data.server.nodeVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-semibold text-gray-800">{data.server.uptimeFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Database Information */}
                <div
                  className={`rounded-xl p-6 border ${
                    data.database.connected
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
                      : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${data.database.connected ? 'bg-green-500' : 'bg-red-500'}`}>
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Database</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-semibold ${
                          data.database.connected ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {data.database.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span className="font-semibold text-gray-800 capitalize">{data.database.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-semibold text-gray-800">{data.database.responseTime}ms</span>
                    </div>
                    {data.database.stats && (
                      <>
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Statistics:</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Collections:</span>
                              <span className="font-semibold text-gray-800">
                                {data.database.stats.collections}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Data Size:</span>
                              <span className="font-semibold text-gray-800">
                                {data.database.stats.dataSize}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Storage Size:</span>
                              <span className="font-semibold text-gray-800">
                                {data.database.stats.storageSize}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Indexes:</span>
                              <span className="font-semibold text-gray-800">
                                {data.database.stats.indexes}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Objects:</span>
                              <span className="font-semibold text-gray-800">
                                {data.database.stats.objects.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {data.database.error && (
                      <div className="mt-3 p-3 bg-red-100 rounded-lg">
                        <p className="text-sm text-red-700">{data.database.error}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Memory Information */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <HardDrive className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Memory</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Process Memory:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">RSS:</span>
                          <span className="font-semibold text-gray-800">{data.memory.process.rss}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heap Total:</span>
                          <span className="font-semibold text-gray-800">
                            {data.memory.process.heapTotal}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Heap Used:</span>
                          <span className="font-semibold text-gray-800">
                            {data.memory.process.heapUsed}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">External:</span>
                          <span className="font-semibold text-gray-800">
                            {data.memory.process.external}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">System Memory:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold text-gray-800">{data.memory.system.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Used:</span>
                          <span className="font-semibold text-gray-800">{data.memory.system.used}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Free:</span>
                          <span className="font-semibold text-gray-800">{data.memory.system.free}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Usage:</span>
                          <span
                            className={`font-semibold ${getUsageColor(data.memory.system.usagePercent)}`}
                          >
                            {data.memory.system.usagePercent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CPU Information */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">CPU</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cores:</span>
                      <span className="font-semibold text-gray-800">{data.cpu.cores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-semibold text-gray-800 text-right text-sm">
                        {data.cpu.model}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Load Average:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">1 min:</span>
                          <span className="font-semibold text-gray-800">
                            {data.cpu.loadAverage[0]?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">5 min:</span>
                          <span className="font-semibold text-gray-800">
                            {data.cpu.loadAverage[1]?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">15 min:</span>
                          <span className="font-semibold text-gray-800">
                            {data.cpu.loadAverage[2]?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-teal-500 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Performance</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">API Response Time</p>
                    <p className="text-2xl font-bold text-teal-600">{data.performance.apiResponseTime}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Database Response Time</p>
                    <p className="text-2xl font-bold text-teal-600">
                      {data.performance.databaseResponseTime}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No health check data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
