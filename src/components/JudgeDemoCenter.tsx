import React, { useState } from 'react';
import { PlayCircle, Shield, CheckCircle2, AlertTriangle, Radio, Mic, WifiOff, Bluetooth, ArrowRight, RotateCcw } from 'lucide-react';

interface JudgeDemoCenterProps {
  onTriggerDemo: (action: string) => void;
  onRefreshData: () => void;
}

export function JudgeDemoCenter({ onTriggerDemo, onRefreshData }: JudgeDemoCenterProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [demoLog, setDemoLog] = useState<string[]>(['Judge Demo Center initialized. Click any step below to execute live demo action.']);
  const [isRunning, setIsRunning] = useState(false);

  const steps = [
    {
      step: 1,
      title: 'Normal Conversation',
      description: 'System remains in SAFE monitoring state. No alerts triggered.',
      action: 'cancel',
      badge: 'SAFE',
    },
    {
      step: 2,
      title: 'Secret Phrase Trigger',
      description: 'User says configured private phrase ("Mummy, blue dress le aana."). Local TFLite model detects phrase with 96% confidence.',
      action: 'secret_phrase',
      badge: 'TRIGGER',
    },
    {
      step: 3,
      title: 'Distress Audio / Scream Detected',
      description: 'YAMNet audio classifier detects scream and emergency keywords ("bachao" / "help").',
      action: 'distress_sound',
      badge: 'AUDIO',
    },
    {
      step: 4,
      title: 'Multi-Signal Risk Engine',
      description: 'Engine combines secret phrase + distress audio + motion anomaly. Calculates Risk Score: 88 / 100 (HIGH RISK).',
      action: 'secret_phrase',
      badge: 'HIGH RISK',
    },
    {
      step: 5,
      title: 'Check-In Prompt',
      description: 'Discreet notification appears: "Are you okay?" with 120-second countdown timer.',
      action: 'secret_phrase',
      badge: 'CHECK-IN',
    },
    {
      step: 6,
      title: 'No Response / Timeout Expired',
      description: 'User does not respond before timeout. State machine escalates to emergency protection.',
      action: 'timeout_expired',
      badge: 'TIMEOUT',
    },
    {
      step: 7,
      title: 'Trusted Contact Alert & Live Location',
      description: 'Emergency push notification dispatched to Priya Sharma & Rohan Verma with live GPS map link.',
      action: 'timeout_expired',
      badge: 'ALERTING',
    },
    {
      step: 8,
      title: 'Offline SMS Fallback',
      description: 'Internet connection disabled. System queues emergency SMS via Android SmsManager.',
      action: 'offline_sms',
      badge: 'OFFLINE SMS',
    },
    {
      step: 9,
      title: 'Bluetooth BLE Mesh Relay',
      description: 'Nearby participating safety-network phone detects BLE emergency beacon (NS-EMERGENCY-82A91) and relays event.',
      action: 'ble_relay',
      badge: 'BLE MESH',
    },
  ];

  const handleRunStep = async (stepObj: typeof steps[0]) => {
    setIsRunning(true);
    setActiveStep(stepObj.step);
    try {
      await onTriggerDemo(stepObj.action);
      setDemoLog(prev => [`[Step ${stepObj.step}] SUCCESS: ${stepObj.title} executed.`, ...prev]);
      onRefreshData();
    } catch (err) {
      setDemoLog(prev => [`[Step ${stepObj.step}] ERROR executing ${stepObj.title}`, ...prev]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">JUDGE DEMO CONTROL CENTER</span>
        <h1 className="text-3xl font-extrabold mt-3">Nari Surakshya / VoxShield Live Demonstration</h1>
        <p className="text-sm text-pink-100 mt-2 max-w-2xl">
          Click any step below to instantly execute backend demo actions and simulate real safety escalations.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((st) => {
          const isCurrent = activeStep === st.step;
          return (
            <div
              key={st.step}
              onClick={() => !isRunning && handleRunStep(st)}
              className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent ? 'border-pink-500 shadow-lg ring-2 ring-pink-500/20 bg-pink-50/30' : 'border-pink-100 shadow-xs hover:border-pink-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
                    0{st.step}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isCurrent ? 'bg-pink-600 text-white animate-pulse' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {st.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900">{st.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{st.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-pink-600">
                  {isCurrent && isRunning ? 'Executing...' : 'Click to Execute'}
                </span>
                <PlayCircle className={`w-5 h-5 ${isCurrent && isRunning ? 'text-pink-600 animate-spin' : 'text-gray-400'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Demo Execution Log */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
            <Radio className="w-4 h-4 text-pink-600" />
            <span>Execution Timeline & Audit Log</span>
          </h2>
          <button
            onClick={() => setDemoLog(['Timeline reset. Ready.']) }
            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Log</span>
          </button>
        </div>

        <div className="bg-gray-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl h-48 overflow-y-auto space-y-2">
          {demoLog.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
