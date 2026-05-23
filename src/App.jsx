import React, { useState, useEffect, createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    deleteUser 
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    collection, 
    query, 
    onSnapshot, 
    serverTimestamp, 
    deleteDoc, 
    getDocs,
    orderBy,
    where 
} from "firebase/firestore";
import { 
    LogOut, Home, Settings, List, Plus, User, Trash2, X, Zap, Heart, Utensils, Smile, Bed, MessageSquare, Star, Download, ChevronRight, FileText, CheckCircle2 
} from 'lucide-react';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro no login:", error);
        }
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading, db }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

const TermsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-8 duration-300">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black text-gray-800 tracking-tight italic">Termos de Uso e Privacidade</h3>
                        <p className="text-xs text-gray-400 mt-1">Sua segurança e transparência em primeiro lugar.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-gray-50/50 text-gray-600 text-sm leading-relaxed font-medium">
                    <h4 className="font-bold text-gray-800 text-base">1. Aceitação dos Termos</h4>
                    <p>Ao utilizar o Confessaí, você concorda em cumprir e se submeter a estes termos de uso. O aplicativo oferece uma plataforma privada para registro de sentimentos e hábitos.</p>
                    
                    <h4 className="font-bold text-gray-800 text-base">2. Privacidade e Proteção de Dados</h4>
                    <p>Seus registros são estritamente confidenciais e vinculados unicamente à sua conta autenticada do Google. Não vendemos, compartilhamos ou expomos seus desabafos e dados com terceiros em hipótese alguma.</p>
                    
                    <h4 className="font-bold text-gray-800 text-base">3. Propriedade e Exclusão dos Dados</h4>
                    <p>Os dados pertencem exclusivamente a você. A qualquer momento, você pode solicitar a exclusão permanente de sua conta e histórico diretamente na aba de Ajustes.</p>

                    <h4 className="font-bold text-gray-800 text-base">4. Responsabilidade</h4>
                    <p>O Confessaí é uma ferramenta de autoconhecimento e bem-estar pessoal, não substituindo acompanhamento médico ou psicológico profissional quando necessário.</p>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 text-sm uppercase tracking-wider"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};


const LoginPage = () => {
    const { loginWithGoogle } = useAuth();
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[40px] shadow-2xl text-center w-full max-w-md border border-white/20 animate-in fade-in zoom-in duration-500">
                <div className="bg-white p-5 rounded-[24px] inline-block mb-6 shadow-lg">
                    <MessageSquare className="w-10 h-10 text-blue-600" />
                </div>
                
                <h1 className="text-4xl font-black mb-2 tracking-tight italic">Confessaí</h1>
                <p className="text-blue-100 mb-10 font-medium italic opacity-80">Seu diário pessoal inteligente</p>
                
                <button 
                    onClick={loginWithGoogle}
                    className="w-full py-4 bg-white text-gray-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center space-x-3 active:scale-95 group"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-black uppercase tracking-tight">Entrar com Google</span>
                </button>
                
                <p className="mt-10 text-[10px] text-blue-200 opacity-60 font-bold uppercase tracking-widest">
                    Seguro • Privado • Gratuito
                </p>
            </div>
        </div>
    );
};

const IntroPage = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    
    const steps = [
        {
            title: "Bem-vindo ao Confessaí",
            description: "Um espaço seguro e privado para você registrar seus pensamentos, sentimentos e hábitos diários.",
            icon: <Smile className="w-16 h-16 text-blue-500" />,
            color: "bg-blue-50"
        },
        {
            title: "Acompanhe sua Saúde",
            description: "Registre seu humor, qualidade do sono, exercícios físicos e muito mais para entender seus padrões.",
            icon: <Heart className="w-16 h-16 text-red-500" />,
            color: "bg-red-50"
        },
        {
            title: "Sua Privacidade em Primeiro",
            description: "Seus dados são protegidos e vinculados à sua conta Google. Você tem total controle sobre seus registros.",
            icon: <Zap className="w-16 h-16 text-yellow-500" />,
            color: "bg-yellow-50"
        }
    ];

    const isLastStep = currentStep === steps.length - 1;

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            if (acceptedTerms) {
                onFinish();
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white p-8">
            <div className="flex-grow flex flex-col items-center justify-center w-full max-w-md">
                <div className={`p-8 rounded-full ${steps[currentStep].color} mb-8 animate-bounce`}>
                    {steps[currentStep].icon}
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 text-center leading-tight">
                    {steps[currentStep].title}
                </h2>
                <p className="text-gray-500 text-center text-lg leading-relaxed font-medium">
                    {steps[currentStep].description}
                </p>
                
                <div className="flex space-x-2 mt-8">
                    {steps.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'}`}
                        />
                    ))}
                </div>

                {isLastStep && (
                    <div className="mt-8 flex items-start space-x-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left w-full animate-in fade-in duration-300">
                        <input 
                            type="checkbox" 
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-xs text-gray-500 font-bold leading-normal cursor-pointer select-none">
                            Li e estou de acordo com os{" "}
                            <button 
                                type="button"
                                onClick={() => setIsTermsOpen(true)}
                                className="text-blue-600 underline font-black hover:text-blue-700 inline"
                            >
                                Termos de Uso e Política de Privacidade
                            </button>{" "}
                            do Confessaí.
                        </label>
                    </div>
                )}
            </div>
            
            <button 
                onClick={nextStep}
                disabled={isLastStep && !acceptedTerms}
                className={`w-full max-w-md py-5 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-95 ${
                    isLastStep && !acceptedTerms 
                    ? 'bg-gray-300 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                <span>{isLastStep ? "Começar Agora" : "Próximo"}</span>
                <ChevronRight className="w-5 h-5" />
            </button>

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </div>
    );
};

const Navigation = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'home', icon: Home, label: 'Início' },
        { id: 'history', icon: List, label: 'Diário' },
        { id: 'new', icon: Plus, label: 'Novo', primary: true },
        { id: 'wellness', icon: Zap, label: 'Saúde' },
        { id: 'settings', icon: Settings, label: 'Ajustes' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 py-3 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => (
                <button 
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex flex-col items-center justify-center transition-all ${
                        item.primary 
                        ? 'bg-blue-600 p-4 rounded-2xl -mt-12 shadow-blue-300 shadow-lg active:scale-90' 
                        : 'flex-1 active:scale-95'
                    }`}
                >
                    <item.icon className={`w-6 h-6 ${
                        item.primary ? 'text-white' : (activeView === item.id ? 'text-blue-600' : 'text-gray-400')
                    }`} />
                    {!item.primary && (
                        <span className={`text-[10px] mt-1 font-bold uppercase tracking-wider ${
                            activeView === item.id ? 'text-blue-600' : 'text-gray-400'
                        }`}>{item.label}</span>
                    )}
                </button>
            ))}
        </nav>
    );
};


const HomePage = ({ setActiveView }) => {
    const { user, db } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [hasRegisteredToday, setHasRegisteredToday] = useState(false);
    const [lastHumor, setLastHumor] = useState('--');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bom dia');
        else if (hour < 18) setGreeting('Boa tarde');
        else setGreeting('Boa noite');
    }, []);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, `users/${user.uid}/records`), orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const recordsData = snapshot.docs.map(doc => doc.data());
                
                const latestRecord = recordsData[0];
                setLastHumor(latestRecord.humor || latestRecord.categoryValue || '--');

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0); 

                const fezRegistroHoje = recordsData.some(record => {
                    if (!record.createdAt) return false;
                    const dataRegistro = record.createdAt.toDate();
                    dataRegistro.setHours(0, 0, 0, 0);
                    return dataRegistro.getTime() === hoje.getTime();
                });

                setHasRegisteredToday(fezRegistroHoje);
            } else {
                setLastHumor('--');
                setHasRegisteredToday(false);
            }
        });

        return () => unsubscribe();
    }, [user, db]);

    return (
        <div className="p-6 pt-12 bg-gray-50 min-h-screen">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 leading-none">{greeting},</h1>
                    <p className="text-gray-400 font-bold mt-1 text-lg italic">{user?.displayName?.split(' ')[0] || 'Usuário'}</p>
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-100 shadow-sm overflow-hidden">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="text-blue-600 w-6 h-6" />
                    )}
                </div>
            </header>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-200 mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Como você está hoje?</h3>
                    <p className="text-blue-100 text-sm mb-6 max-w-[200px]">Registrar seus sentimentos ajuda no seu autoconhecimento diário.</p>
                    <button 
                        onClick={() => setActiveView('new')}
                        className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
                    >
                        {hasRegisteredToday ? 'Atualizar Registro' : 'Novo Registro'}
                    </button>
                </div>
                <Heart className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Meta Diária Dinâmica baseada em registros de hoje */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                    <div className={`p-3 rounded-2xl w-fit mb-4 ${hasRegisteredToday ? 'bg-green-100' : 'bg-orange-100'}`}>
                        {hasRegisteredToday ? (
                            <CheckCircle2 className="text-green-600 w-5 h-5" />
                        ) : (
                            <Zap className="text-orange-600 w-5 h-5" />
                        )}
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Meta Diária</p>
                    <p className="text-2xl font-black text-gray-800">{hasRegisteredToday ? '1/1' : '0/1'}</p>
                </div>

                {/* Humor baseado no último desabafo real */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                    <div className="bg-blue-100 p-3 rounded-2xl w-fit mb-4">
                        <Heart className="text-blue-600 w-5 h-5" />
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Último Humor</p>
                    <p className="text-2xl font-black text-gray-800 capitalize">{lastHumor}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                <h4 className="font-black text-gray-800 mb-4">Dica de Bem-estar</h4>
                <div className="flex items-start space-x-4">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                        <Star className="text-blue-500 w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed italic">
                        "Tente fazer 5 minutos de respiração consciente hoje. Isso pode reduzir significativamente o seu estresse acumulado."
                    </p>
                </div>
            </div>
        </div>
    );
};

const NewRegistrationPage = ({ setActiveView, activeCategories }) => {
    const { user, db } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [form, setForm] = useState({
        humor: 'Bem',
        sono: '6a7h',
        saude: 'NaoExercicio',
        vitalidade: 'Energia',
        social: 'Sociabilidade',
        lazer: 'Passatempo',
        tela: '1hMenos',
        ciclo: 'Normal',
        content: ''
    });

    const stepMapping = [
        { id: 'Humor', title: 'Como está seu Humor?', field: 'humor', optionKey: 'humor' },
        { id: 'Sono', title: 'Como você dormiu?', field: 'sono', optionKey: 'sono' },
        { id: 'Saude', title: 'Fez exercícios hoje?', field: 'saude', optionKey: 'saude' },
        { id: 'Vitalidade', title: 'Como está sua Energia?', field: 'vitalidade', optionKey: 'vitalidade' },
        { id: 'Social', title: 'Vida Social?', field: 'social', optionKey: 'social' },
        { id: 'Lazer', title: 'Teve tempo de Lazer?', field: 'lazer', optionKey: 'lazer' },
        { id: 'TempoDeTela', title: 'Tempo de Tela?', field: 'tela', optionKey: 'tela' },
        { id: 'Ciclo', title: 'Ciclo / Outros?', field: 'ciclo', optionKey: 'ciclo' },
    ];

    const activeSteps = stepMapping.filter(stepItem => 
        activeCategories ? activeCategories[stepItem.id] !== false : true
    );

    const totalSteps = activeSteps.length;

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await setDoc(doc(collection(db, `users/${user.uid}/records`)), {
                ...form,
                createdAt: serverTimestamp(),
                userId: user.uid,
                category: "Geral",
                categoryValue: form.humor 
            });
            setActiveView('history');
        } catch (e) {
            alert("Erro ao salvar registro");
        }
        setIsSubmitting(false);
    };

    const options = {
        humor: [
            { id: 'Bem', label: 'Bem', icon: '😊' }, { id: 'Feliz', label: 'Feliz', icon: '😄' },
            { id: 'Confiante', label: 'Confiante', icon: '😎' }, { id: 'Triste', label: 'Triste', icon: '😔' }, { id: 'Raiva', label: 'Raiva', icon: '🤬' }
        ],
        sono: [
            { id: 'Menos6h', label: 'Menos 6h', icon: '😴' }, { id: '6a7h', label: '6-7 horas', icon: '⏰' }, { id: '8hMais', label: '8h ou mais', icon: '🛌' }
        ],
        saude: [
            { id: 'SimExercicio', label: 'Fiz Exercício', icon: '💪' }, { id: 'NaoExercicio', label: 'Não fiz', icon: '🛋️' }
        ],
        vitalidade: [
            { id: 'MuitaEnergia', label: 'Muita Energia', icon: '⚡' }, { id: 'Energia', label: 'Normal', icon: '🔋' }, { id: 'Cansaco', label: 'Cansaço', icon: '😩' }
        ],
        social: [
            { id: 'Sociabilidade', label: 'Socializei', icon: '🤝' }, { id: 'Isolamento', label: 'Fiquei só', icon: '👤' }
        ],
        lazer: [
            { id: 'Passatempo', label: 'Tive Lazer', icon: '🎮' }, { id: 'SemLazer', label: 'Sem Lazer', icon: '💼' }
        ],
        tela: [
            { id: '1hMenos', label: 'Pouca Tela', icon: '📱' }, { id: '1a3h', label: 'Moderado', icon: '📱' }, { id: '3hMais', label: 'Muita Tela', icon: '📱' }
        ],
        ciclo: [
            { id: 'Normal', label: 'Normal', icon: '💧' }, { id: 'TPM', label: 'TPM', icon: '🌪️' }, { id: 'Fluxo', label: 'Menstruada', icon: '🩸' }
        ]
    };

    const currentStepIndex = step - 1;
    const currentStepData = activeSteps[currentStepIndex] || activeSteps[activeSteps.length - 1];

    if (!currentStepData) return null;
    const isLastStep = step === totalSteps;

    return (
        <div className="p-6 pt-12 pb-32 max-w-lg mx-auto bg-gray-50 min-h-screen">
            <div className="mb-10 flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i + 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-right-4">
                <h2 className="text-3xl font-black mb-8 text-gray-800 italic uppercase leading-none">
                    {currentStepData.title}
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {options[currentStepData.optionKey]?.map(o => (
                        <button 
                            key={o.id} 
                            onClick={() => setForm({...form, [currentStepData.field]: o.id})}
                            className={`p-6 rounded-[32px] border-2 flex flex-col items-center gap-3 transition-all ${form[currentStepData.field] === o.id ? 'border-blue-600 bg-white shadow-xl scale-105' : 'border-transparent bg-white text-gray-400 shadow-sm'}`}
                        >
                            <span className="text-4xl">{o.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">{o.label}</span>
                        </button>
                    ))}
                </div>

                {isLastStep && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="text-xl font-black mb-3 text-gray-700 italic">Algo mais a declarar?</h3>
                        <textarea 
                            className="w-full p-6 h-36 bg-white border border-gray-100 rounded-[32px] outline-none focus:ring-4 focus:ring-blue-100 mb-6 shadow-sm font-medium"
                            placeholder="Escreva aqui seu desabafo opcional..."
                            value={form.content}
                            onChange={(e) => setForm({...form, content: e.target.value})}
                        />
                        <button 
                            onClick={handleSave} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-transform uppercase tracking-widest"
                        >
                            {isSubmitting ? 'Salvando...' : 'Finalizar e Salvar Tudo'}
                        </button>
                    </div>
                )}

                <div className="mt-6 space-y-4">
                    {!isLastStep && (
                        <button 
                            onClick={() => setStep(step + 1)} 
                            className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center uppercase tracking-widest"
                        >
                            Próximo <ChevronRight className="ml-2 w-5 h-5" />
                        </button>
                    )}
                    {step > 1 && (
                        <button 
                            onClick={() => setStep(step - 1)} 
                            className="w-full py-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest text-center block mx-auto"
                        >
                            Voltar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const HistoryPage = ({ setActiveView }) => {
    const { user, db } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, `users/${user.uid}/records`), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, db]);

    const deleteRecord = async (id) => {
        if (window.confirm("Excluir este registro?")) {
            await deleteDoc(doc(db, `users/${user.uid}/records`, id));
        }
    };

    return (
        <div className="p-6 pt-12 pb-32 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 italic">Meu Diário</h2>
                <span className="text-[10px] font-black text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    {records.length} REGISTROS
                </span>
            </header>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="space-y-6">
                    {records.map((record) => (
                        <div key={record.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-yellow-50 text-yellow-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                        {record.humor || record.categoryValue}
                                    </span>
                                    {record.sono && (
                                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                            {record.sono === '8h Mais' ? 'Dormi bem' : record.sono === '6a7h' ? 'Sono Médio' : 'Dormi pouco'}
                                        </span>
                                    )}
                                    {record.saude === 'SimExercicio' && (
                                        <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                            💪 Ativo
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => deleteRecord(record.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <p className="text-gray-700 leading-relaxed font-medium text-sm mb-4">
                                {record.content || <span className="text-gray-300 italic text-xs">Apenas registro de hábitos.</span>}
                            </p>

                            <div className="flex gap-4 pt-4 border-t border-gray-50 text-gray-400">
                                {record.vitalidade && <div className="flex items-center gap-1 text-[9px] font-bold uppercase"><Zap size={12}/> {record.vitalidade}</div>}
                                {record.social && <div className="flex items-center gap-1 text-[9px] font-bold uppercase"><User size={12}/> {record.social}</div>}
                                {record.tela && <div className="flex items-center gap-1 text-[9px] font-bold uppercase"><Plus size={12}/> Tela: {record.tela}</div>}
                            </div>
                            
                            <div className="mt-2 text-[9px] text-gray-300 font-bold uppercase tracking-widest text-right">
                                {record.createdAt?.toDate().toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const BemEstarPage = () => {
    return (
        <div className="p-6 pt-12 pb-32 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-black text-gray-900 mb-8 italic leading-none">Minha Saúde</h2>
            
            <div className="bg-white p-8 rounded-[40px] text-center border border-gray-100 shadow-sm mb-6">
                <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="text-blue-600 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2 italic">Insights em Breve</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Em breve você terá acesso a gráficos detalhados sobre como seu sono e alimentação afetam seu humor.
                </p>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-1/3 rounded-full animate-pulse"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-100">
                    <Bed className="w-8 h-8 mb-4 opacity-50" />
                    <h4 className="text-xl font-bold mb-2 italic">Sono Consistente</h4>
                    <p className="text-indigo-100 text-xs font-medium leading-relaxed">
                        Manter um horário regular para dormir ajuda a regular seu ciclo circadiano.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <Utensils className="text-orange-500 w-8 h-8 mb-4 opacity-50" />
                    <h4 className="text-xl font-black text-gray-800 mb-2 italic">Alimentação</h4>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed">
                        Registre o que você come para descobrir padrões que podem estar afetando sua energia.
                    </p>
                </div>
            </div>
        </div>
    );
};

const SettingsPage = ({ activeCategories, setActiveCategories }) => { 
    const { user, logout } = useAuth();
    const [userName, setUserName] = useState('Usuário Anônimo');
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setUserName(user.displayName || user.email || 'Usuário Anônimo');
        }
    }, [user]);

    const customizeItems = [
        { id: 'Humor', label: 'Sentimentos', icon: '😊', description: 'Essencial', disabled: true },
        { id: 'Saude', label: 'Exercícios e Dores', icon: '🤕', description: 'Atividade física e bem-estar físico' },
        { id: 'Sono', label: 'Qualidade do sono', icon: '😴', description: 'Horas descansadas' },
        { id: 'Vitalidade', label: 'Vitalidade', icon: '⚡', description: 'Nível de energia diária' },
        { id: 'Ciclo', label: 'Ciclo Menstrual', icon: '🌸', description: 'Fases e sintomas' },
        { id: 'Social', label: 'Vida Social', icon: '👥', description: 'Interações e isolamento' },
        { id: 'Lazer', label: 'Lazer e Hobbies', icon: '🎮', description: 'Tempo livre e viagens' },
        { id: 'TempoDeTela', label: 'Tempo de tela', icon: '📱', description: 'Uso de dispositivos' },
    ];

    const toggleCategory = (id) => {
        setActiveCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const restoreDefaults = () => {
        setActiveCategories({
            Humor: true, Saude: true, Sono: true, Vitalidade: true, Ciclo: true, Social: true, Lazer: true, TempoDeTela: true
        });
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("ATENÇÃO: Tem certeza que deseja apagar permanentemente sua conta e todos os seus registros salvos? Esta ação não pode ser desfeita.")) {
            try {
                if (auth.currentUser) {
                    await deleteUser(auth.currentUser);
                    localStorage.removeItem('confessai_intro_seen');
                    localStorage.removeItem('confessai_active_categories');
                    window.location.reload();
                }
            } catch (error) {
                alert("Para apagar sua conta por segurança, você precisa ter feito login recentemente. Faça login novamente e tente de novo.");
            }
        }
    };

    return (
        <div className="p-4 pt-8 pb-20 max-w-lg mx-auto bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-8 border-b border-gray-200 pb-3 italic">
                <Settings className="inline w-6 h-6 mr-2 text-blue-600 animate-spin-slow" />
                Configurações
            </h2>

            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 px-2">Customização</h3>
            <section className="bg-white p-4 rounded-xl shadow-md mb-6">
                <button
                    onClick={() => setShowCustomizeModal(true)}
                    className="w-full flex justify-between items-center py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                    <div className="flex items-center space-x-3">
                        <span className="text-xl">⚙️</span>
                        <div>
                            <p className="text-gray-700 font-bold">Personalizar Registro</p>
                            <p className="text-xs text-gray-400">Escolha o que faz sentido registrar no seu dia</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
            </section>

            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 px-2">Legal</h3>
            <section className="bg-white p-4 rounded-xl shadow-md mb-8">
                <button
                    onClick={() => setIsTermsOpen(true)}
                    className="w-full flex justify-between items-center py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                    <div className="flex items-center space-x-3">
                        <div className="text-xl bg-gray-50 p-2 rounded-xl text-gray-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <p className="text-gray-700 font-bold">Termos e Privacidade</p>
                            <p className="text-xs text-gray-400">Políticas de privacidade e condições de uso</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
            </section>

            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 px-2">Sua Conta</h3>
            <section className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center italic">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    {userName}
                </h3>
                <p className="text-sm text-gray-500 mb-6 break-all font-medium">{user?.email || 'Não disponível'}</p>
                
                <button 
                    onClick={logout}
                    className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition flex items-center justify-center space-x-2"
                >
                    <LogOut size={18} />
                    <span>Sair da Conta</span>
                </button>
            </section>
            
            <div className="p-2">
                <button
                    onClick={handleDeleteAccount}
                    className="w-full py-3 px-4 bg-red-700 text-white font-bold rounded-xl shadow-md hover:bg-red-800 transition duration-300 flex items-center justify-center space-x-2 uppercase text-xs tracking-wider"
                >
                    <Trash2 className="w-5 h-5" />
                    <span>Excluir Minha Conta</span>
                </button>
            </div>

            {/* Modal de Personalização */}
            {showCustomizeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-300">
                        
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight">Personalizar registro</h3>
                                <p className="text-sm text-gray-500 mt-1">Escolha o que faz sentido para você registrar no seu dia.</p>
                            </div>
                            <button onClick={() => setShowCustomizeModal(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-gray-50/50">
                            {customizeItems.map((item) => {
                                const isChecked = activeCategories ? activeCategories[item.id] !== false : true;
                                return (
                                    <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="text-2xl bg-gray-50 p-2 rounded-xl">{item.icon}</div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{item.label}</p>
                                                <p className="text-[11px] text-gray-400">{item.description}</p>
                                                {item.disabled && <span className="text-[9px] font-bold text-blue-500 uppercase bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">Sempre visível</span>}
                                            </div>
                                        </div>

                                        <button
                                            disabled={item.disabled}
                                            onClick={() => toggleCategory(item.id)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 outline-none ${
                                                isChecked ? 'bg-cyan-500 justify-end' : 'bg-gray-200 justify-start'
                                            } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="bg-white w-4 h-4 rounded-full shadow-md transition-all duration-300"></div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
                            <button 
                                onClick={restoreDefaults}
                                className="text-xs font-bold text-gray-500 hover:text-cyan-600 flex items-center gap-1 transition-colors"
                            >
                                🔄 Restaurar padrão
                            </button>
                            <button
                                onClick={() => setShowCustomizeModal(false)}
                                className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-xl shadow-md hover:bg-cyan-700 transition-all text-sm"
                            >
                                Concluído
                            </button>
                        </div>

                    </div>
                </div>
            )}

            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </div>
    );
};

const App = () => {
    const [hasSeenIntro, setHasSeenIntro] = useState(() => {
        const saved = localStorage.getItem('confessai_intro_seen');
        return saved === 'true';
    });

    const [activeView, setActiveView] = useState('home');
    const { user } = useAuth(); 

    const [activeCategories, setActiveCategories] = useState(() => {
        const saved = localStorage.getItem('confessai_active_categories');
        return saved ? JSON.parse(saved) : {
            Humor: true,
            Saude: true,
            Sono: true,
            Vitalidade: true,
            Ciclo: true,
            Social: true,
            Lazer: true,
            TempoDeTela: true
        };
    });

    useEffect(() => {
        localStorage.setItem('confessai_active_categories', JSON.stringify(activeCategories));
    }, [activeCategories]);

    let content;

    if (!hasSeenIntro) {
        content = <IntroPage onFinish={() => {
            setHasSeenIntro(true);
            localStorage.setItem('confessai_intro_seen', 'true');
        }} />;
    } else if (!user) {
        content = <LoginPage />;
    } else {
        switch (activeView) {
            case 'home':
                content = <HomePage setActiveView={setActiveView} />; 
                break;
            case 'new':
                content = <NewRegistrationPage setActiveView={setActiveView} activeCategories={activeCategories} />;
                break;
            case 'history':
                content = <HistoryPage setActiveView={setActiveView} />;
                break;
            case 'wellness':
                content = <BemEstarPage />;
                break;
            case 'settings':
                content = <SettingsPage activeCategories={activeCategories} setActiveCategories={setActiveCategories} />; 
                break;
            default:
                content = <HomePage setActiveView={setActiveView} />; 
        }
    }

    return (
        <div className="flex flex-col min-h-screen font-sans">
            <main className="flex-grow">{content}</main>
            {hasSeenIntro && user && (
                 <Navigation activeView={activeView} setActiveView={setActiveView} />
            )}
        </div>
    );
};

const ConfessaiApp = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default ConfessaiApp;

export default ConfessaiApp;
