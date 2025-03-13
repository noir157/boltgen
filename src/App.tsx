// Dentro do componente App
// Adicione estes estados
const [isCheckingServer, setIsCheckingServer] = useState(true);
const [corsTestResult, setCorsTestResult] = useState<boolean | null>(null);

// Modificar o useEffect para verificação de servidor
useEffect(() => {
  const checkStatus = async () => {
    setIsCheckingServer(true);
    try {
      const accountManager = new AccountManager();
      
      // Primeiro teste CORS
      const corsOk = await accountManager.testCors();
      setCorsTestResult(corsOk);
      console.log('Teste CORS:', corsOk ? 'Passou' : 'Falhou');
      
      // Depois verifica status
      const status = await accountManager.checkServerStatus();
      setServerStatus(status);
      console.log('Status do servidor:', status ? 'Online' : 'Offline');
    } catch (error) {
      console.error('Erro ao verificar status do servidor:', error);
      setServerStatus(false);
    } finally {
      setIsCheckingServer(false);
    }
  };
  
  checkStatus();
  // Verificar a cada 30 segundos
  const interval = setInterval(checkStatus, 30000);
  
  return () => clearInterval(interval);
}, []);

// No renderTab, modifique para mostrar o status de verificação:
{serverStatus === false && (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4"
  >
    <div className="flex items-center gap-2 text-red-400">
      <Server size={20} className="animate-pulse" />
      <div>
        <p className="font-mono text-sm">
          {isCheckingServer 
            ? 'Verificando conexão com o servidor...' 
            : 'O servidor está offline. Não é possível criar contas no momento.'}
        </p>
        {corsTestResult === false && (
          <p className="font-mono text-xs mt-1">
            Erro de CORS detectado. O servidor pode estar bloqueando requisições deste domínio.
          </p>
        )}
        <button 
          onClick={() => {
            setIsCheckingServer(true);
            const accountManager = new AccountManager();
            accountManager.checkServerStatus().then(status => {
              setServerStatus(status);
              setIsCheckingServer(false);
            });
          }}
          className="text-xs text-blue-400 underline mt-2"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  </motion.div>
)}
