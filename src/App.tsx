import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Typewriter from 'typewriter-effect';
import {
  Terminal,
  Circle,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCcw,
  Settings,
  Info,
  AlertCircle,
  Shield,
  Key,
  Mail,
  User,
  Clock,
  ChevronRight,
  Server
} from 'lucide-react';
import { AccountManager } from './services/AccountManager';

interface AccountInfo {
  email: string;
  username: string;
  password: string;
  confirmed: boolean;
}

interface AccountStats {
  totalCreated: number;
  successRate: number;
  averageTime: number;
}

function App() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<AccountInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'status' | 'settings'>('create');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<AccountStats>({
    totalCreated: 0,
    successRate: 100,
    averageTime: 0
  });
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);

  // Verificar status do servidor ao carregar
  useEffect(() => {
    const checkStatus = async () => {
      const accountManager = new AccountManager();
      const status = await accountManager.checkServerStatus();
      setServerStatus(status);
    };

    checkStatus();
    // Verificar a cada 30 segundos
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateAccount = async () => {
    setIsCreating(true);
    setError(null);
    setResult(null);
    setProgress(0);

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 90));
    }, 200);

    try {
      const accountManager = new AccountManager();
      const response = await accountManager.createAndConfirmAccount();

      if (response.success && response.accountInfo) {
        setResult(response.accountInfo);
        setStats(prev => ({
          totalCreated: prev.totalCreated + 1,
          successRate: ((prev.totalCreated * prev.successRate + 100) / (prev.totalCreated + 1)),
          averageTime: ((prev.averageTime * prev.totalCreated + (Date.now() - startTime)) / (prev.totalCreated + 1))
        }));
        setProgress(100);
      } else {
        throw new Error(response.error || 'Failed to create account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStats(prev => ({
        ...prev,
        successRate: ((prev.totalCreated * prev.successRate) / (prev.totalCreated + 1))
      }));
    } finally {
      clearInterval(progressInterval);
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderTab = (tab: 'create' | 'status' | 'settings') => {
    switch (tab) {
      case 'create':
        return (
          <div className="space-y-6">
            {serverStatus === false && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4"
              >
                <div className="flex items-center gap-2 text-red-400">
                  <Server size={20} className="animate-pulse" />
                  <p className="font-mono text-sm">
                    O servidor está offline. Não é possível criar contas no momento.
                  </p>
                </div>
              </motion.div>
            )}

            {!isCreating && !result && !error && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-4"
              >
                <div className="terminal-output">
                  <Typewriter
                    options={{
                      strings: [
                        'Welcome to bolt.new account creator',
                        'Ready to create a new account...',
                        'All systems operational...'
                      ],
                      autoStart: true,
                      loop: true,
                      delay: 50,
                      deleteSpeed: 30
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateAccount}
                    disabled={serverStatus === false}
                    className={`bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-lg font-mono flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors glow-effect ${serverStatus === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Circle className={serverStatus === false ? '' : 'animate-spin'} size={20} />
                    Create New Account
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('status')}
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-6 py-3 rounded-lg font-mono flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-colors"
                  >
                    <Info size={20} />
                    View Statistics
                  </motion.button>
                </div>
              </motion.div>
            )}

            {isCreating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="text-center space-y-4">
                  <RefreshCcw size={40} className="animate-spin mx-auto text-blue-400 floating-icon" />
                  <div className="terminal-output info-text">
                    <Typewriter
                      options={{
                        strings: [
                          'Initializing account creation...',
                          'Configuring security settings...',
                          'Verifying credentials...',
                          'Setting up account protection...'
                        ],
                        autoStart: true,
                        loop: true,
                        delay: 50
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-gray-400 font-mono">
                    {progress}%
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <XCircle size={24} />
                  <h3 className="font-mono">Error Detected</h3>
                </div>
                <p className="terminal-output error-text">{error}</p>
                <div className="flex gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-300 font-mono flex items-center gap-2"
                  >
                    <RefreshCcw size={16} />
                    Retry Operation
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab('status')}
                    className="text-blue-400 hover:text-blue-300 font-mono flex items-center gap-2"
                  >
                    <Info size={16} />
                    Check Status
                  </motion.button>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 size={24} className="floating-icon" />
                    <h3 className="font-mono">Account Created Successfully</h3>
                  </div>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/5 p-4 rounded-lg glow-effect"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Mail size={16} className="text-blue-400" />
                        <label className="text-sm font-mono text-gray-400">Email</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={result.email}
                          className="terminal-input w-full"
                        />
                        <button
                          onClick={() => copyToClipboard(result.email, 'email')}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                          <Copy size={20} className={copied === 'email' ? 'text-green-400' : 'text-gray-400'} />
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/5 p-4 rounded-lg glow-effect"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-purple-400" />
                        <label className="text-sm font-mono text-gray-400">Username</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={result.username}
                          className="terminal-input w-full"
                        />
                        <button
                          onClick={() => copyToClipboard(result.username, 'username')}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                          <Copy size={20} className={copied === 'username' ? 'text-green-400' : 'text-gray-400'} />
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white/5 p-4 rounded-lg glow-effect"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Key size={16} className="text-yellow-400" />
                        <label className="text-sm font-mono text-gray-400">Password</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={result.password}
                          className="terminal-input w-full font-mono"
                        />
                        <button
                          onClick={() => copyToClipboard(result.password, 'password')}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                          <Copy size={20} className={copied === 'password' ? 'text-green-400' : 'text-gray-400'} />
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateAccount}
                      disabled={serverStatus === false}
                      className={`bg-blue-500/20 border border-blue-500/30 text-blue-400 px-6 py-3 rounded-lg font-mono flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-colors ${serverStatus === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Circle size={20} />
                      Create Another Account
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('status')}
                      className="bg-purple-500/20 border border-purple-500/30 text-purple-400 px-6 py-3 rounded-lg font-mono flex items-center justify-center gap-2 hover:bg-purple-500/30 transition-colors"
                    >
                      <Info size={20} />
                      View Statistics
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'status':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/5 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Server size={20} className={serverStatus === null ? 'animate-pulse text-yellow-400' : (serverStatus ? 'text-green-400' : 'text-red-400')} />
                <h3 className="font-mono text-gray-400">Server Status</h3>
              </div>
              <div className={`status-badge ${serverStatus === null ? 'status-badge-warning' : (serverStatus ? 'status-badge-success' : 'status-badge-error')}`}>
                {serverStatus === null ? 'Checking...' : (serverStatus ? 'Online' : 'Offline')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-green-400" size={20} />
                  <h3 className="font-mono text-gray-400">Total Created</h3>
                </div>
                <p className="text-2xl font-mono text-green-400">{stats.totalCreated}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-yellow-400" size={20} />
                  <h3 className="font-mono text-gray-400">Success Rate</h3>
                </div>
                <p className="text-2xl font-mono text-yellow-400">{stats.successRate.toFixed(1)}%</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-blue-400" size={20} />
                  <h3 className="font-mono text-gray-400">Average Time</h3>
                </div>
                <p className="text-2xl font-mono text-blue-400">{(stats.averageTime / 1000).toFixed(1)}s</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('create')}
              className="w-full bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-lg font-mono flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors"
            >
              <ChevronRight size={20} />
              Return to Account Creation
            </motion.button>
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-mono text-gray-400 mb-4">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">API Connection</span>
                  <span className={`status-badge ${serverStatus === null ? 'status-badge-warning' : (serverStatus ? 'status-badge-success' : 'status-badge-error')}`}>
                    {serverStatus === null ? 'Checking...' : (serverStatus ? 'Online' : 'Offline')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">Email Service</span>
                  <span className="status-badge status-badge-success">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">Account Creation</span>
                  <span className={`status-badge ${serverStatus ? 'status-badge-success' : 'status-badge-error'}`}>
                    {serverStatus ? 'Ready' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-mono text-gray-400 mb-4">About</h3>
              <p className="text-sm text-gray-300 font-mono">
                This application creates bolt.new accounts automatically. It uses a secure backend service to handle the registration process and verification.
              </p>
              <p className="text-sm text-gray-300 font-mono mt-2">
                Version: 1.0.0
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('create')}
              className="w-full bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-lg font-mono flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors"
            >
              <ChevronRight size={20} />
              Return to Account Creation
            </motion.button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen terminal-bg p-8 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-3xl terminal-window rounded-lg overflow-hidden shadow-2xl"
      >
        <div className="terminal-header px-4 py-2 flex items-center">
          <div className="flex space-x-2">
            <div className="terminal-button terminal-button-red" />
            <div className="terminal-button terminal-button-yellow" />
            <div className="terminal-button terminal-button-green" />
          </div>
          <div className="flex-1 text-center">
            <div className="text-gray-400 text-sm font-mono flex items-center justify-center gap-2">
              <Terminal size={14} />
              bolt.new account creator
            </div>
          </div>
        </div>

        <div className="border-b border-white/10">
          <div className="flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`terminal-tab ${activeTab === 'create' ? 'active' : ''}`}
            >
              Create Account
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`terminal-tab ${activeTab === 'status' ? 'active' : ''}`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`terminal-tab ${activeTab === 'settings' ? 'active' : ''}`}
            >
              System Status
            </button>
          </div>
        </div>

        <div className="p-6">
          {renderTab(activeTab)}
        </div>
      </motion.div>
    </div>
  );
}

export default App;