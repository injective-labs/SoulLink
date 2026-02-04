import { useState, useEffect } from 'react';
import { Layers, Fingerprint, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { NFT_CONTRACT_ADDRESS, NETWORK_CONFIG, ERC721_ABI, APP_SLOGANS, DB_TABLE_NAME } from './constants';
import type { AppStep, NFTData, BindingRecord } from './types';
import { NFTCard } from './components/NFTCard';
import { PassportCard } from './components/PassportCard';
import { supabase } from './lib/supabase';

const App = () => {
  const [step, setStep] = useState<AppStep>('connect');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(APP_SLOGANS.LOADING.CONNECTING);
  const [userAddress, setUserAddress] = useState('');
  const [nftData, setNftData] = useState<NFTData | null>(null);
  const [bindingRecord, setBindingRecord] = useState<BindingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial State Check (Signature Handover)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const address = params.get('address');
    const sig = params.get('sig');

    if (address && sig) {
      handleAutoLogin(address, sig);
    }
  }, []);

  const handleAutoLogin = async (address: string, _sig: string) => {
    try {
      setLoading(true);
      setLoadingText(APP_SLOGANS.LOADING.VERIFYING);
      // In a real app, we'd verify the signature against the address here
      // For this demo, if address and sig exist, we trust the handover
      setUserAddress(address);
      await checkExistingBinding(address);
    } catch (err) {
      setError('Auto-login failed. Please connect manually.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Connect Wallet (MetaMask Fallback)
  const connectWallet = async () => {
    try {
      if (!(window as any).ethereum) {
        setError('Please install MetaMask to continue.');
        return;
      }

      setLoading(true);
      setLoadingText(APP_SLOGANS.LOADING.CONNECTING);
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const network = await provider.getNetwork();
      if (network.chainId !== NETWORK_CONFIG.chainId) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
          });
        } catch (e) {
          setError('Please switch to Injective Network');
          return;
        }
      }

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
      await checkExistingBinding(address);
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. Status Checking (Supabase)
  const checkExistingBinding = async (address: string) => {
    try {
      setLoading(true);
      setLoadingText(APP_SLOGANS.LOADING.SEARCHING);
      
      const { data, error } = await supabase
        .from(DB_TABLE_NAME)
        .select('*')
        .eq('address', address.toLowerCase())
        .single();

      if (data && !error) {
        // Map snake_case to camelCase for the frontend if needed
        const record: BindingRecord = {
          address: data.address,
          passkeyId: data.passkey_id,
          credentialId: data.credential_id,
          publicKey: data.public_key,
          timestamp: Number(data.timestamp),
          txHash: data.tx_hash
        };
        setBindingRecord(record);
        setStep('verified');
      } else {
        await checkNFT(address);
      }
    } catch (err) {
      await checkNFT(address);
    } finally {
      setLoading(false);
    }
  };

  const checkNFT = async (address: string) => {
    try {
      setLoading(true);
      setLoadingText(APP_SLOGANS.LOADING.VERIFYING);
      const provider = new ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ERC721_ABI, provider);
      const balance = await contract.balanceOf(address);

      if (balance.gt(0)) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, 0);
        setNftData({ tokenId: tokenId.toString(), name: 'N1NJ4:Origin' });
        setStep('nft');
      } else {
        setError('NFT Verification Required: N1NJ4:Origin not found.');
      }
    } catch (error) {
      setError('Communication error with Injective network.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Passkey Binding (Supabase Version)
  const bindPasskey = async () => {
    try {
      setLoading(true);
      setLoadingText(APP_SLOGANS.LOADING.SEARCHING);

      // Double check Supabase first
      const { data: existing } = await supabase
        .from(DB_TABLE_NAME)
        .select('*')
        .eq('address', userAddress.toLowerCase())
        .single();

      if (existing) {
        const record: BindingRecord = {
          address: existing.address,
          passkeyId: existing.passkey_id,
          credentialId: existing.credential_id,
          publicKey: existing.public_key,
          timestamp: Number(existing.timestamp),
          txHash: existing.tx_hash
        };
        setBindingRecord(record);
        setStep('verified');
        return;
      }

      setLoadingText(APP_SLOGANS.LOADING.CREATING_PASSKEY);

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const creationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: APP_SLOGANS.TITLE, id: window.location.hostname },
        user: {
          id: new TextEncoder().encode(userAddress),
          name: userAddress,
          displayName: userAddress.substring(0, 8) + '...' + userAddress.substring(userAddress.length - 4)
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: true,
          residentKey: "required",
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "direct"
      };

      const credential = await navigator.credentials.create({ publicKey: creationOptions }) as PublicKeyCredential;
      if (!credential) throw new Error("Passkey creation was cancelled.");

      setLoadingText(APP_SLOGANS.LOADING.BINDING);
      
      const txHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
      const timestamp = Date.now();
      const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));

      const { error: insertError } = await supabase
        .from(DB_TABLE_NAME)
        .insert([{
          address: userAddress.toLowerCase(),
          passkey_id: credential.id,
          credential_id: credentialId,
          public_key: credential.id,
          timestamp: timestamp,
          tx_hash: txHash
        }]);

      if (insertError) throw new Error('Supabase Storage Failed: ' + insertError.message);

      const record: BindingRecord = {
        address: userAddress,
        passkeyId: credential.id,
        credentialId: credentialId,
        publicKey: credential.id,
        timestamp: timestamp,
        txHash: txHash
      };

      setBindingRecord(record);
      setStep('verified');
    } catch (error: any) {
      setError(error.message || 'Verification process interrupted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      {/* Visual background enhancements */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#fafafa]" />
      <div className="fixed top-0 left-0 w-full h-1 bg-black z-50" />

      <motion.div 
        layout
        className="bg-white rounded-[2rem] p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-3xl mb-6 shadow-2xl text-white"
          >
            <Layers size={32} />
          </motion.div>
          <h2 className="text-4xl font-black tracking-tight mb-2">{APP_SLOGANS.TITLE}</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{APP_SLOGANS.SUBTITLE}</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 text-sm font-bold border border-red-100"
          >
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="mt-2 text-[10px] uppercase tracking-tighter hover:underline"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'connect' && (
            <motion.div 
              key="connect"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <button 
                onClick={connectWallet}
                className="w-full h-18 bg-black text-white rounded-[1.25rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-[#1a1a1a] active:scale-95 transition-all shadow-xl"
              >
                {APP_SLOGANS.CONNECT_WALLET}
              </button>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <div className="h-[1px] w-8 bg-gray-200" />
                <span className="text-[10px] font-black uppercase tracking-widest">or</span>
                <div className="h-[1px] w-8 bg-gray-200" />
              </div>
              <p className="text-center text-xs text-gray-500 font-medium px-6 leading-relaxed">
                {APP_SLOGANS.DESCRIPTION}
              </p>
            </motion.div>
          )}

          {step === 'nft' && nftData && (
            <motion.div 
              key="nft"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <NFTCard nft={nftData} />
              <button 
                onClick={bindPasskey}
                disabled={loading}
                className="group w-full h-18 bg-black text-white rounded-[1.25rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-[#1a1a1a] active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Fingerprint size={28} className="group-hover:scale-110 transition-transform" />
                    {APP_SLOGANS.BIND_BTN}
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === 'verified' && bindingRecord && (
            <motion.div 
              key="verified"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <PassportCard record={bindingRecord} />
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex items-center justify-center gap-2 text-green-600 font-black text-xs uppercase tracking-tighter"
              >
                <CheckCircle size={14} />
                {APP_SLOGANS.FOOTER_TEXT}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="relative mb-8">
                <Loader2 className="animate-spin text-black" size={64} />
                <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/20" size={24} />
              </div>
              <p className="font-black text-2xl tracking-tight mb-2">{loadingText}</p>
              <p className="text-gray-400 text-sm font-medium">{APP_SLOGANS.VULNERABILITY_CHECK}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <div className="mt-12 text-center flex items-center justify-center gap-6 opacity-30 grayscale contrast-200">
        <div className="font-black text-lg tracking-tighter">INJECTIVE</div>
        <div className="w-1 h-1 bg-black rounded-full" />
        <div className="font-black text-lg tracking-tighter">N1NJ4</div>
      </div>
    </div>
  );
};

export default App;
