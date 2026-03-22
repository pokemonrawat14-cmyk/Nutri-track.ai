import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Camera, 
  History, 
  BarChart3, 
  User as UserIcon, 
  ChevronRight, 
  ArrowLeft,
  Utensils,
  Flame,
  Dumbbell,
  Target,
  Loader2,
  X
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import { analyzeMealText, analyzeMealPhoto } from './services/gemini';
import { UserProfile, MealLog, DailyStats } from './types';
import { cn } from './lib/utils';

// --- Components ---

const Onboarding = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: 25,
    height: 175,
    weight: 70,
    goal: 'maintain'
  });

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const calculateCalories = (p: Partial<UserProfile>) => {
    // Basic Mifflin-St Jeor Equation (simplified)
    const bmr = 10 * (p.weight || 70) + 6.25 * (p.height || 175) - 5 * (p.age || 25) + 5;
    let target = bmr * 1.375; // Light activity
    if (p.goal === 'lose') target -= 500;
    if (p.goal === 'gain') target += 500;
    return Math.round(target);
  };

  const finish = () => {
    const finalProfile = {
      ...profile,
      dailyCalorieTarget: calculateCalories(profile)
    } as UserProfile;
    onComplete(finalProfile);
  };

  const steps = [
    {
      title: "Welcome to NutriTrack",
      desc: "Let's personalize your experience. How old are you?",
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-bold text-primary">{profile.age}</div>
          <input 
            type="range" min="13" max="100" 
            value={profile.age} 
            onChange={e => setProfile(p => ({ ...p, age: parseInt(e.target.value) }))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      )
    },
    {
      title: "Your Height",
      desc: "We use this to calculate your metabolic rate.",
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-bold text-primary">{profile.height} <span className="text-2xl text-zinc-400">cm</span></div>
          <input 
            type="range" min="120" max="230" 
            value={profile.height} 
            onChange={e => setProfile(p => ({ ...p, height: parseInt(e.target.value) }))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      )
    },
    {
      title: "Your Weight",
      desc: "Current weight helps us track your progress.",
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-bold text-primary">{profile.weight} <span className="text-2xl text-zinc-400">kg</span></div>
          <input 
            type="range" min="30" max="200" 
            value={profile.weight} 
            onChange={e => setProfile(p => ({ ...p, weight: parseInt(e.target.value) }))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      )
    },
    {
      title: "Your Goal",
      desc: "What do you want to achieve?",
      content: (
        <div className="grid grid-cols-1 gap-4 w-full">
          {[
            { id: 'lose', label: 'Lose Weight', icon: <Flame className="w-5 h-5" /> },
            { id: 'maintain', label: 'Maintain Weight', icon: <Target className="w-5 h-5" /> },
            { id: 'gain', label: 'Gain Weight', icon: <Dumbbell className="w-5 h-5" /> }
          ].map(g => (
            <button
              key={g.id}
              onClick={() => setProfile(p => ({ ...p, goal: g.id as any }))}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                profile.goal === g.id 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "border-zinc-100 bg-white text-zinc-600"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl",
                profile.goal === g.id ? "bg-primary text-white" : "bg-zinc-100"
              )}>
                {g.icon}
              </div>
              <span className="font-semibold text-lg">{g.label}</span>
            </button>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col p-8">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold tracking-tight">{steps[step].title}</h1>
            <p className="text-zinc-500 text-lg leading-relaxed">{steps[step].desc}</p>
          </div>
          
          <div className="py-8">
            {steps[step].content}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between max-w-md mx-auto w-full pt-8">
        {step > 0 ? (
          <button onClick={prev} className="p-4 text-zinc-400 font-medium flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        ) : <div />}
        
        <button 
          onClick={step === steps.length - 1 ? finish : next}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          {step === steps.length - 1 ? 'Get Started' : 'Next'} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ logs, profile }: { logs: MealLog[], profile: UserProfile }) => {
  const today = new Date().toDateString();
  const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === today);
  
  const consumed = todayLogs.reduce((acc, l) => acc + l.calories, 0);
  const remaining = Math.max(0, profile.dailyCalorieTarget - consumed);
  const progress = (consumed / profile.dailyCalorieTarget) * 100;

  const macros = todayLogs.reduce((acc, l) => ({
    p: acc.p + l.protein,
    c: acc.c + l.carbs,
    f: acc.f + l.fat
  }), { p: 0, c: 0, f: 0 });

  const data = [
    { name: 'Consumed', value: consumed },
    { name: 'Remaining', value: remaining }
  ];

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-zinc-400 font-medium">Daily Progress</h2>
          <h1 className="text-3xl font-display font-bold">Today</h1>
        </div>
        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
          <UserIcon className="text-zinc-400" />
        </div>
      </header>

      <div className="relative flex justify-center items-center py-4">
        <div className="w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={80}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill="var(--color-primary)" />
                <Cell fill="#f4f4f5" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-display font-bold">{remaining}</span>
          <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Kcal Left</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Protein', value: macros.p, color: 'bg-blue-500', target: 150 },
          { label: 'Carbs', value: macros.c, color: 'bg-orange-500', target: 250 },
          { label: 'Fat', value: macros.f, color: 'bg-yellow-500', target: 70 }
        ].map(m => (
          <div key={m.label} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-2 h-2 rounded-full", m.color)} />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">{m.label}</span>
            </div>
            <div className="text-lg font-bold">{Math.round(m.value)}g</div>
            <div className="w-full h-1 bg-zinc-100 rounded-full mt-2 overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", m.color)} 
                style={{ width: `${Math.min(100, (m.value / m.target) * 100)}%` }} 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-display font-bold">Recent Meals</h3>
        <div className="space-y-3">
          {todayLogs.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <Utensils className="w-8 h-8 opacity-20" />
              <p>No meals logged today</p>
            </div>
          ) : (
            todayLogs.slice(0, 3).map(log => (
              <div key={log.id} className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  {log.type === 'photo' ? <Camera className="w-6 h-6" /> : <Utensils className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-zinc-800">{log.name}</h4>
                  <p className="text-xs text-zinc-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">+{log.calories}</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Kcal</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const LogMeal = ({ onLog }: { onLog: (meal: Omit<MealLog, 'id' | 'timestamp'>) => void }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleTextSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeMealText(text);
      onLog({ ...result, type: 'text' });
      setText('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setLoading(true);
      try {
        const result = await analyzeMealPhoto(base64);
        onLog({ ...result, type: 'photo', imageUrl: base64 });
        setPreview(null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-zinc-400 font-medium">Log your meal</h2>
        <h1 className="text-3xl font-display font-bold">AI Assistant</h1>
      </header>

      <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Describe your meal</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. 2 eggs, a slice of whole wheat toast and half an avocado"
            className="w-full h-32 p-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-primary/20 resize-none text-zinc-800 placeholder:text-zinc-300"
          />
        </div>

        <button
          onClick={handleTextSubmit}
          disabled={loading || !text.trim()}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Log with AI
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase font-bold text-zinc-300 bg-white px-4">Or use camera</div>
        </div>

        <div className="flex gap-4">
          <label className="flex-1 bg-secondary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-secondary/20 transition-transform active:scale-95">
            <Camera className="w-5 h-5" />
            Scan Photo
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
          </label>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full relative">
            <img src={preview} alt="Preview" className="w-full aspect-square object-cover" />
            <div className="p-8 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-bold text-zinc-800">Analyzing your meal...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryLog = ({ logs }: { logs: MealLog[] }) => {
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  
  const grouped = sortedLogs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, MealLog[]>);

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h2 className="text-zinc-400 font-medium">Your journey</h2>
        <h1 className="text-3xl font-display font-bold">History</h1>
      </header>

      <div className="space-y-8">
        {Object.entries(grouped).map(([date, dayLogs]) => (
          <div key={date} className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest sticky top-0 bg-zinc-50 py-2 z-10">
              {date === new Date().toDateString() ? 'Today' : date}
            </h3>
            <div className="space-y-3">
              {dayLogs.map(log => (
                <div key={log.id} className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 bg-zinc-50 rounded-2xl overflow-hidden flex items-center justify-center">
                    {log.imageUrl ? (
                      <img src={log.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Utensils className="text-zinc-300 w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-800 leading-tight">{log.name}</h4>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{log.protein}g P</span>
                      <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase">{log.carbs}g C</span>
                      <span className="text-[10px] bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full font-bold uppercase">{log.fat}g F</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-display font-bold text-primary">{log.calories}</div>
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Kcal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Analytics = ({ logs }: { logs: MealLog[] }) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === date);
    return {
      name: new Date(date).toLocaleDateString([], { weekday: 'short' }),
      calories: dayLogs.reduce((acc, l) => acc + l.calories, 0),
    };
  });

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h2 className="text-zinc-400 font-medium">Performance</h2>
        <h1 className="text-3xl font-display font-bold">Analytics</h1>
      </header>

      <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Weekly Calories</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis hide />
              <RechartsTooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="calories" 
                fill="var(--color-primary)" 
                radius={[8, 8, 8, 8]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Avg Daily</div>
          <div className="text-3xl font-display font-bold text-zinc-800">
            {Math.round(chartData.reduce((acc, d) => acc + d.calories, 0) / 7)}
          </div>
          <div className="text-xs text-zinc-400 font-medium">Kcal / day</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Total Meals</div>
          <div className="text-3xl font-display font-bold text-zinc-800">{logs.length}</div>
          <div className="text-xs text-zinc-400 font-medium">Logged</div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('nutritrack_profile');
    const savedLogs = localStorage.getItem('nutritrack_logs');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      if (profile) localStorage.setItem('nutritrack_profile', JSON.stringify(profile));
      localStorage.setItem('nutritrack_logs', JSON.stringify(logs));
    }
  }, [profile, logs, initialized]);

  if (!initialized) return null;

  if (!profile) {
    return <Onboarding onComplete={setProfile} />;
  }

  const addLog = (meal: Omit<MealLog, 'id' | 'timestamp'>) => {
    const newLog: MealLog = {
      ...meal,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    setLogs(prev => [newLog, ...prev]);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-zinc-50 max-w-md mx-auto relative flex flex-col">
      <main className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <Dashboard logs={logs} profile={profile} />}
            {activeTab === 'log' && <LogMeal onLog={addLog} />}
            {activeTab === 'history' && <HistoryLog logs={logs} />}
            {activeTab === 'analytics' && <Analytics logs={logs} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-8 py-4 flex justify-between items-center z-50">
        {[
          { id: 'home', icon: <Utensils className="w-6 h-6" />, label: 'Home' },
          { id: 'log', icon: <Plus className="w-8 h-8" />, label: 'Log', special: true },
          { id: 'history', icon: <History className="w-6 h-6" />, label: 'History' },
          { id: 'analytics', icon: <BarChart3 className="w-6 h-6" />, label: 'Stats' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center transition-all",
              tab.special 
                ? "bg-primary text-white p-3 rounded-2xl -mt-12 shadow-xl shadow-primary/30" 
                : activeTab === tab.id ? "text-primary" : "text-zinc-300"
            )}
          >
            {tab.icon}
            {!tab.special && <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">{tab.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
