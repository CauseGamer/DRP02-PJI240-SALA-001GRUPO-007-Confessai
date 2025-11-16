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
    orderBy 
} from "firebase/firestore";
import { 
    LogOut, Home, Settings, List, Plus, User, Trash2, X, Zap, Heart, Utensils, Smile, Bed, MessageSquare, Star, Download, ChevronRight 
} from 'lucide-react';



// --- CONFIGURAÇÃO FIREBASE (Mantenha as suas chaves aqui) ---
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

// --- 1. CONTEXTO DE AUTENTICAÇÃO ---

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

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

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro ao fazer login com Google:", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('confessai_intro_seen'); 
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        logout,
        db, 
        auth
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-600">Carregando...</p>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- 2. COMPONENTES DE TELA E UTILS ---

// Componente: Modal de Confirmação
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting, error }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-red-600 flex items-center">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Confirmação de Exclusão
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <p className="text-gray-700 mb-4">
                    Esta ação é <span className="font-bold text-red-600">permanente</span>. Todos os seus registros e a sua conta serão excluídos.
                </p>

                <p className="text-sm text-gray-500 mb-6 border-l-4 border-yellow-400 pl-3 py-1 bg-yellow-50">
                    Se você não fez login recentemente, a exclusão pode falhar.
                </p>
                
                {error && (
                    <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm mb-4">
                        Erro: {error}. Por favor, faça login novamente e tente de novo.
                    </p>
                )}

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition duration-300 disabled:bg-red-300 flex items-center justify-center"
                    >
                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente: Tela de Introdução (Mantida)
const IntroPage = ({ onAccept }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-blue-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform transition-all duration-300 hover:shadow-xl">
                <h1 className="text-3xl font-extrabold text-blue-800 mb-4">Bem-vindo ao Confessaí</h1>
                <p className="text-gray-600 mb-6">
                    Seu diário anônimo e seguro para desabafos e reflexões.
                </p>
                <button
                    onClick={onAccept}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};

// Componente: Tela de Login (Mantida)
const LoginPage = () => {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Acesso Seguro</h2>
                <p className="text-gray-500 mb-8">
                    Faça login para proteger e sincronizar seus registros.
                </p>
                <button
                    onClick={signInWithGoogle}
                    className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition duration-300 flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Google Icon SVG */}
                        <path fill="#FFC107" d="M43.61 20.083H24V28.917H35.417C34.917 31.5 33.167 33.417 30.667 35.083L30.5 35.25L37.833 41L38 41.167C42.833 37.167 46.167 31.417 46.167 24.583C46.167 22.917 45.833 21.333 45.333 20.083H43.61Z"/>
                        <path fill="#FF3D00" d="M24 46.167C29.667 46.167 34.5 44.25 38 41.167L30.667 35.083C28.833 36.333 26.583 37.083 24 37.083C18.667 37.083 14.167 33.5 12.583 28.583L12.417 28.417L5.083 34.083L5.0 34.25C8.833 41.667 15.833 46.167 24 46.167Z"/>
                        <path fill="#4CAF50" d="M12.583 28.583C11.667 25.917 11.667 22.917 12.583 20.083L12.417 20.25L5 14.5L4.917 14.583C1.667 18.083 0 22.167 0 24.583C0 27.167 0.833 30 2.5 32.5L12.583 28.583Z"/>
                        <path fill="#1976D2" d="M24 7.083C26.833 7.083 29.5 8.167 31.75 10.333L38.25 4.583C34.25 1.5 29.5 0 24 0C15.833 0 8.833 4.5 5 11.917L12.583 20.083C14.167 15.167 18.667 11.583 24 11.583Z"/>
                    </svg>
                    <span>Entrar com Google</span>
                </button>
            </div>
        </div>
    );
};

// Componente: Navegação
const Navigation = ({ activeView, setActiveView }) => {
    // Adicionamos a view 'wellness' (Bem-Estar)
    const navItems = [
        { id: 'home', icon: Home, label: 'Início' },
        { id: 'new', icon: Plus, label: 'Registro' },
        { id: 'history', icon: List, label: 'Diário' },
        { id: 'wellness', icon: Heart, label: 'Bem-Estar' },
        { id: 'settings', icon: Settings, label: 'Config' }, 
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-50">
            <nav className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`flex flex-col items-center justify-center p-2 text-sm transition-colors duration-200 ${
                            activeView === item.id 
                                ? 'text-blue-600 font-bold' 
                                : 'text-gray-500 hover:text-blue-500'
                        }`}
                    >
                        <item.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

// Componente: Botão de Logout
const LogoutButton = () => {
    const { logout } = useAuth();
    return (
        <button
            onClick={logout}
            className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition duration-300 flex items-center justify-center space-x-2"
        >
            <LogOut className="w-5 h-5" />
            <span>Terminar Sessão (Logout)</span>
        </button>
    );
};


// Componente: Tela de Configurações
const SettingsPage = () => { 
    const { user, db, auth } = useAuth();
    const [userName, setUserName] = useState('Usuário Anônimo');
    
    // Estados para o modal de exclusão
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletionError, setDeletionError] = useState('');

    useEffect(() => {
        if (user) {
            setUserName(user.displayName || user.email || 'Usuário Anônimo');
        }
    }, [user]);

    // Função de exclusão de conta
    const handleDeleteAccount = async () => {
        if (!user) {
            setDeletionError("Usuário não está logado.");
            return;
        }

        setIsDeleting(true);
        setDeletionError('');

        try {
            const userId = user.uid;

            // 1. Excluir TODOS os registros do Firestore
            const recordsRef = collection(db, `users/${userId}/records`);
            const snapshot = await getDocs(recordsRef);

            for (const docSnapshot of snapshot.docs) {
                await deleteDoc(doc(db, `users/${userId}/records`, docSnapshot.id));
            }

            // 2. Excluir o usuário do Firebase Auth
            await deleteUser(user);
            
        } catch (error) {
            console.error("Erro ao excluir conta:", error);
            
            let errorMessage = "Ocorreu um erro desconhecido.";
            if (error.code === 'auth/requires-recent-login') {
                errorMessage = "É necessário fazer login novamente. Saia e entre novamente, e tente excluir a conta em 5 minutos.";
            } else if (error.message) {
                 errorMessage = error.message;
            }

            setDeletionError(errorMessage);
            setIsDeleting(false);
            return; 
        }

        setShowDeleteModal(false);
        setIsDeleting(false);
    };

    const PolicyLink = ({ label }) => (
        <div 
            onClick={() => console.log(`Abrindo ${label}...`)}
            className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        >
            <span className="text-gray-700">{label}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
    );

    return (
        <div className="p-4 pt-8 pb-20 max-w-lg mx-auto bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-8 border-b border-gray-200 pb-3">
                <Settings className="inline w-6 h-6 mr-2 text-blue-600" />
                Conta e Perfil
            </h2>

            {/* Seção de Informações da Conta */}
            <section className="bg-white p-6 rounded-xl shadow-xl mb-8">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    {userName}
                </h3>
                <p className="text-sm text-gray-500 mb-4 break-all">{user?.email || 'Não disponível'}</p>
                <p className="text-xs font-mono text-gray-400 mb-6 break-all">ID do Usuário: {user?.uid || 'N/A'}</p>
                <LogoutButton />
            </section>
            
            {/* PREFERÊNCIAS (SEÇÃO REMOVIDA POIS FICOU VAZIA) */}

            {/* INFORMAÇÕES E POLÍTICAS */}
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 px-2">Informações e Políticas</h3>
            <section className="bg-white p-4 rounded-xl shadow-xl mb-8">
                <PolicyLink label="Política de Privacidade" />
                <PolicyLink label="Termos de Uso" />
                <PolicyLink label="Fale Conosco" />
            </section>
            
            {/* Excluir Conta */}
            <div className="p-2">
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full py-3 px-4 bg-red-700 text-white font-bold rounded-lg shadow-lg hover:bg-red-800 transition duration-300 flex items-center justify-center space-x-2"
                >
                    <Trash2 className="w-5 h-5" />
                    <span>Excluir Conta Permanentemente</span>
                </button>
            </div>


            <p className="text-center text-xs text-gray-400 mt-8">
                Versão 1.2 - Protótipo
            </p>
            
            <DeleteConfirmationModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                isDeleting={isDeleting}
                error={deletionError}
            />
        </div>
    );
};


// Componente: Tela de Novo Registro 
const NewRegistrationPage = ({ setActiveView }) => {
    const { user, db } = useAuth();
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Humor');
    // ESTADO PRINCIPAL: Valor específico da categoria (ex: 'Alegre', '8h')
    const [categoryValue, setCategoryValue] = useState('Alegre'); 
    // SUB-ESTADOS
    const [painValue, setPainValue] = useState(null); // Usado em 'Saude'
    const [screenTimeValue, setScreenTimeValue] = useState(null); // NOVO: Usado em 'TempoDeTela'
    const [severityValue, setSeverityValue] = useState(null); // NOVO: Usado em 'Ciclo'
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    
    // Configurações e opções dinâmicas para cada categoria
    const categories = [
        { id: 'Humor', label: 'Sentimentos', icon: Smile, color: 'text-blue-500' },
        { id: 'Sono', label: 'Sono', icon: Bed, color: 'text-indigo-500' },
        { id: 'Saude', label: 'Saúde', icon: Heart, color: 'text-red-500' },
        { id: 'Vitalidade', label: 'Vitalidade', icon: Zap, color: 'text-yellow-500' },
        { id: 'Social', label: 'Vida Social', icon: User, color: 'text-green-500' },
        { id: 'Lazer', label: 'Lazer', icon: Utensils, color: 'text-purple-500' },
        { id: 'TempoDeTela', label: 'Tempo de Tela', icon: Star, color: 'text-cyan-500' }, // NOVA CATEGORIA
        { id: 'Ciclo', label: 'Ciclo Menstrual', icon: MessageSquare, color: 'text-pink-500' }, // NOVA CATEGORIA
    ];
    
    // Opções de seleção para o campo categoryValue - ATUALIZADAS
    const categoryValueOptions = {
        Humor: [
            { id: 'Bem', label: 'Bem', icon: '😊', color: 'bg-green-200 border-green-500' },
            { id: 'Feliz', label: 'Feliz', icon: '😄', color: 'bg-yellow-200 border-yellow-500' },
            { id: 'Confidente', label: 'Confiante', icon: '😎', color: 'bg-indigo-200 border-indigo-500' },
            { id: 'Exultante', label: 'Exultante', icon: '🥳', color: 'bg-pink-200 border-pink-500' },
            { id: 'Sensivel', label: 'Sensível', icon: '🥺', color: 'bg-blue-200 border-blue-500' },
            { id: 'Triste', label: 'Triste', icon: '😔', color: 'bg-gray-200 border-gray-500' },
            { id: 'Irritavel', label: 'Irritável', icon: '😠', color: 'bg-red-200 border-red-500' },
            { id: 'Raiva', label: 'Raiva', icon: '🤬', color: 'bg-purple-200 border-purple-500' },
        ],
        Sono: [
            { id: 'Menos6h', label: 'Menos de 6h', icon: '😴', color: 'bg-red-200 border-red-500' },
            { id: '6a7h', label: '6 a 7 horas', icon: '⏰', color: 'bg-yellow-200 border-yellow-500' },
            { id: '8hMais', label: '8h ou mais', icon: '🛌', color: 'bg-green-200 border-green-500' },
        ],
        Saude: [
            { id: 'SimExercicio', label: 'Sim, me exercitei', icon: '💪', color: 'bg-green-200 border-green-500' },
            { id: 'NaoExercicio', label: 'Não fiz exercício', icon: '🛋️', color: 'bg-red-200 border-red-500' },
        ],
        // ATUALIZADO: Vitalidade
        Vitalidade: [
            { id: 'MuitaEnergia', label: 'Muita Energia', icon: '⚡️', color: 'bg-green-200 border-green-500' },
            { id: 'Energia', label: 'Energia', icon: '🔋', color: 'bg-yellow-200 border-yellow-500' },
            { id: 'Cansaco', label: 'Cansaço', icon: '😩', color: 'bg-orange-200 border-orange-500' },
            { id: 'Exaustao', label: 'Exaustão', icon: '👻', color: 'bg-red-200 border-red-500' },
        ],
        Social: [
            { id: 'Introversao', label: 'Introversão', icon: '📖', color: 'bg-indigo-200 border-indigo-500' },
            { id: 'Sociabilidade', label: 'Sociável', icon: '🤝', color: 'bg-green-200 border-green-500' },
            { id: 'Digital', label: 'Apenas Interação digital', icon: '📱', color: 'bg-blue-200 border-blue-500' },
            { id: 'Isolamento', label: 'Isolamento', icon: '👤', color: 'bg-red-200 border-red-500' },
        ],
        // NOVO: Lazer com blocos solicitados
        Lazer: [
            { id: 'Ferias', label: 'Férias', icon: '🌴', color: 'bg-green-200 border-green-500' },
            { id: 'Viagem', label: 'Viagem', icon: '✈️', color: 'bg-blue-200 border-blue-500' },
            { id: 'Encontro', label: 'Encontro', icon: '👥', color: 'bg-pink-200 border-pink-500' },
            { id: 'Passatempo', label: 'Passatempo', icon: '🎮', color: 'bg-yellow-200 border-yellow-500' },
        ],
        // NOVO: Tempo de Tela (atividade)
        TempoDeTela: [
            { id: 'CelularRedeSocial', label: 'Celular/Rede Social', icon: '📱', color: 'bg-cyan-200 border-cyan-500' },
            { id: 'TV', label: 'TV', icon: '📺', color: 'bg-indigo-200 border-indigo-500' },
            { id: 'VideoGame', label: 'Video Game', icon: '🕹️', color: 'bg-purple-200 border-purple-500' },
        ],
        // NOVO: Ciclo Menstrual (fase)
        Ciclo: [ 
            { id: 'TPM', label: 'TPM', icon: '😠', color: 'bg-red-200 border-red-500' },
            { id: 'Menstruacao', label: 'Menstruação', icon: '🩸', color: 'bg-pink-200 border-pink-500' },
        ],
    };
    
    // Opções para a sub-categoria Dor (mantido)
    const painValueOptions = [
        { id: 'SemDor', label: 'Sem Dor', icon: '🙂', color: 'bg-green-200 border-green-500' },
        { id: 'DorCabeca', label: 'Dor de Cabeça', icon: '🤕', color: 'bg-red-200 border-red-500' },
        { id: 'DorCostas', label: 'Dor nas Costas', icon: '🧘', color: 'bg-yellow-200 border-yellow-500' },
        { id: 'DorArticulacoes', label: 'Dor nas Articulações', icon: '🦴', color: 'bg-orange-200 border-orange-500' },
        { id: 'DorBarriga', label: 'Dor de Barriga', icon: '🤢', color: 'bg-purple-200 border-purple-500' },
    ];
    
    // NOVO: Opções para o Tempo de Tela (quantidade de tempo)
    const screenTimeOptions = [
        { id: '1hMenos', label: '< 1h', icon: '⏱️', color: 'bg-green-200 border-green-500' },
        { id: '1a3h', label: '1 - 3h', icon: '⏳', color: 'bg-yellow-200 border-yellow-500' },
        { id: '3a5h', label: '3 - 5h', icon: '📈', color: 'bg-orange-200 border-orange-500' },
        { id: '5hMais', label: '> 5h', icon: '🚨', color: 'bg-red-200 border-red-500' },
    ];
    
    // NOVO: Opções para a Intensidade do Ciclo
    const severityOptions = [
        { id: 'Leve', label: 'Leve', icon: '🟢', color: 'bg-green-200 border-green-500' },
        { id: 'Moderada', label: 'Moderada', icon: '🟡', color: 'bg-yellow-200 border-yellow-500' },
        { id: 'Intensa', label: 'Intensa', icon: '🔴', color: 'bg-red-200 border-red-500' },
    ];


    // useEffect para redefinir os valores ao trocar a categoria
    useEffect(() => {
        const defaultOption = categoryValueOptions[category] && categoryValueOptions[category][0];
        setCategoryValue(defaultOption ? defaultOption.id : null);
        
        // Reset/Define o valor de dor apenas para a categoria Saúde
        if (category === 'Saude') {
             setPainValue('SemDor'); // Define o padrão 'Sem Dor'
        } else {
             setPainValue(null); // Limpa para outras categorias
        }
        
        // NOVO: Reset/Define o valor para Tempo de Tela
        if (category === 'TempoDeTela') {
             setScreenTimeValue(screenTimeOptions[0].id); 
        } else {
             setScreenTimeValue(null);
        }
        
        // NOVO: Reset/Define o valor para Ciclo Menstrual
        if (category === 'Ciclo') {
             setSeverityValue(severityOptions[0].id); 
        } else {
             setSeverityValue(null);
        }
        
    }, [category]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Exige pelo menos a seleção e o conteúdo de texto para categorias sem seletor
        const isContentRequired = !categoryValueOptions[category];

        if (isContentRequired && !content.trim()) {
             setMessage('Preencha o campo de anotação.');
             return;
        }
        
        // Exige a seleção de dor se a categoria for Saúde
        if (category === 'Saude' && !painValue) {
             setMessage('Selecione o estado da dor (ou Sem Dor).');
             return;
        }
        
        // NOVO: Exige a seleção de tempo de tela se a categoria for TempoDeTela
        if (category === 'TempoDeTela' && !screenTimeValue) {
             setMessage('Selecione a quantidade de tempo de tela.');
             return;
        }

        // NOVO: Exige a seleção de intensidade se a categoria for Ciclo
        if (category === 'Ciclo' && !severityValue) {
             setMessage('Selecione a intensidade dos sintomas.');
             return;
        }


        setIsSubmitting(true);
        setMessage('');

        try {
            const userId = user.uid;
            
            const recordData = {
                content: content.trim(),
                category: category,
                categoryValue: categoryValue, // Valor principal (Ex: Exercício, Humor, Atividade de Lazer, Atividade de Tela, Fase do Ciclo)
                createdAt: serverTimestamp(),
                userId: userId, 
            };
            
            // Adicionar sub-valores se aplicável
            if (category === 'Saude') {
                 recordData.painValue = painValue; 
            }
            // NOVO: Adicionar screenTimeValue
            if (category === 'TempoDeTela') {
                 recordData.screenTimeValue = screenTimeValue; 
            }
            // NOVO: Adicionar severityValue
            if (category === 'Ciclo') {
                 recordData.severityValue = severityValue; 
            }


            await setDoc(doc(collection(db, `users/${userId}/records`)), recordData);

            setContent('');
            setCategory('Humor');
            setCategoryValue('Alegre'); 
            setPainValue(null); // Limpar estado de dor
            setScreenTimeValue(null); // Limpar estado de tempo de tela
            setSeverityValue(null); // Limpar estado de intensidade
            setMessage('Registro salvo com sucesso!');
            setTimeout(() => {
                setMessage('');
                setActiveView('history'); // Redireciona para o diário/histórico
            }, 1500);

        } catch (e) {
            console.error("Erro ao adicionar documento: ", e);
            setMessage('Erro ao salvar registro. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Componente de Seleção Contextual (Mantido)
    const CategoryValueSelector = ({ category, selectedValue, onChange }) => {
        const options = categoryValueOptions[category];

        if (!options) {
            return (
                <p className="text-gray-500 p-4 border border-gray-200 rounded-lg bg-white">
                    Selecione a categoria e use a caixa de texto para registrar.
                </p>
            );
        }
        
        // Renderiza seletores em grid (2 colunas)
        const isGrid = category === 'Humor' || category === 'Saude' || category === 'Vitalidade' || category === 'Lazer' || category === 'TempoDeTela' || category === 'Ciclo';
        
        return (
            <div className={`mt-4 mb-6 p-4 rounded-xl shadow-inner ${isGrid ? 'bg-gray-100' : 'bg-white border border-gray-200'}`}>
                <p className="text-sm font-semibold text-gray-700 mb-3">Selecione o principal valor para {category}:</p>
                
                <div className={`flex flex-wrap ${isGrid ? 'gap-2' : 'space-x-3'}`}>
                    {options.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onChange(option.id)}
                            className={`
                                py-2 px-3 rounded-xl text-sm transition-all duration-200 text-center
                                ${isGrid ? 'w-[calc(50%-4px)]' : 'flex-1'}
                                ${
                                    selectedValue === option.id
                                        ? `${option.color} text-gray-900 font-bold shadow-md ring-2 ring-blue-500`
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                                }
                            `}
                        >
                            <span className="text-xl mr-1">{option.icon}</span> 
                            <span className="font-medium">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };


    return (
        <div className="p-4 pt-8 pb-32 max-w-lg mx-auto bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">O que você quer registrar?</h2>
            
            {/* Abas de Categoria */}
            <div 
                className="flex space-x-2 mb-4 border-b border-gray-200 overflow-x-auto pb-2" 
                style={{
                    msOverflowStyle: 'none', 
                    scrollbarWidth: 'none',  
                }}
            > 
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex-shrink-0 flex items-center text-sm px-3 py-2 rounded-full font-medium whitespace-nowrap transition-colors duration-200 ${
                            category === cat.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <cat.icon className={`w-4 h-4 mr-1 ${category !== cat.id ? cat.color : ''}`} />
                        {cat.label}
                    </button>
                ))}
            </div>
            
            {/* Seletor Contextual de Valor */}
            <CategoryValueSelector 
                category={category} 
                selectedValue={categoryValue} 
                onChange={setCategoryValue} 
            />

            {/* Seletor de Dor para Categoria Saúde */}
            {category === 'Saude' && (
                <div className="mt-4 mb-6 p-4 rounded-xl shadow-inner bg-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Qual dor você sentiu hoje?</p>
                    <div className="flex flex-wrap gap-2">
                        {painValueOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setPainValue(option.id)}
                                className={`
                                    w-[calc(50%-4px)] py-2 px-3 rounded-xl text-sm transition-all duration-200 text-center
                                    ${
                                        painValue === option.id
                                            ? `${option.color} text-gray-900 font-bold shadow-md ring-2 ring-blue-500`
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                                    }
                                `}
                            >
                                <span className="text-xl mr-1">{option.icon}</span> 
                                <span className="font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* NOVO: Seletor de Tempo Gasto para Categoria TempoDeTela */}
            {category === 'TempoDeTela' && (
                <div className="mt-4 mb-6 p-4 rounded-xl shadow-inner bg-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Quanto tempo você gastou em {categoryValueOptions.TempoDeTela.find(opt => opt.id === categoryValue)?.label || 'tela'}?</p>
                    <div className="flex flex-wrap gap-2">
                        {screenTimeOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setScreenTimeValue(option.id)}
                                className={`
                                    w-[calc(50%-4px)] py-2 px-3 rounded-xl text-sm transition-all duration-200 text-center
                                    ${
                                        screenTimeValue === option.id
                                            ? `${option.color} text-gray-900 font-bold shadow-md ring-2 ring-blue-500`
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                                    }
                                `}
                            >
                                <span className="text-xl mr-1">{option.icon}</span> 
                                <span className="font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* NOVO: Seletor de Intensidade para Categoria Ciclo Menstrual */}
            {category === 'Ciclo' && (
                <div className="mt-4 mb-6 p-4 rounded-xl shadow-inner bg-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Qual a intensidade dos sintomas de {categoryValueOptions.Ciclo.find(opt => opt.id === categoryValue)?.label || 'sintomas'}?</p>
                    <div className="flex flex-wrap gap-2">
                        {severityOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setSeverityValue(option.id)}
                                className={`
                                    w-[calc(50%-4px)] py-2 px-3 rounded-xl text-sm transition-all duration-200 text-center
                                    ${
                                        severityValue === option.id
                                            ? `${option.color} text-gray-900 font-bold shadow-md ring-2 ring-blue-500`
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                                    }
                                `}
                            >
                                <span className="text-xl mr-1">{option.icon}</span> 
                                <span className="font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}


            <form onSubmit={handleSubmit} className="relative">
                
                {/* Área de Texto */}
                <div className="w-full">
                    <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                        Anotação (Detalhes e Desabafo):
                    </label>
                    <textarea
                        id="content"
                        rows="6"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none bg-white text-gray-800"
                        placeholder={`Descreva seus pensamentos e o motivo de se sentir ${categoryValue || 'assim'}...`}
                        required={!categoryValueOptions[category]} // Requerido apenas se não houver seletor
                    />
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-center font-medium ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
                
                {/* Botão Salvar (Fixo na parte inferior) */}
                <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-lg mx-auto shadow-2xl">
                    <button
                        type="submit"
                        disabled={isSubmitting || (!content.trim() && !categoryValue)}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
                    </button>
                </div>
            </form>
        </div>
    );
};


// Componente: Card de Registro (Atualizado para usar categoryValue e painValue)
// Componente: Card de Registro (Atualizado para usar categoryValue e painValue)
const RecordCard = ({ record }) => {
    
    // NOVO: MAPEAMENTO CENTRALIZADO DE TODOS OS IDS PARA SEUS LABELS COMPLETOS
    const FULL_VALUE_MAP = {
        // HUMOR
        'Bem': 'Bem', 'Feliz': 'Feliz', 'Confidente': 'Confiante', 'Exultante': 'Exultante', 
        'Sensivel': 'Sensível', 'Triste': 'Triste', 'Irritavel': 'Irritável', 'Raiva': 'Raiva',
        // SONO
        'Menos6h': 'Menos de 6h', '6a7h': '6 a 7 horas', '8hMais': '8h ou mais',
        // SAÚDE
        'SimExercicio': 'Sim, me exercitei', 'NaoExercicio': 'Não fiz exercício',
        // VITALIDADE
        'MuitaEnergia': 'Muita Energia', 'Energia': 'Energia', 'Cansaco': 'Cansaço', 'Exaustao': 'Exaustão',
        // SOCIAL (NOVO)
        'Introversao': 'Introversão', 'Sociabilidade': 'Sociável', 'Digital': 'Apenas Interação digital', 'Isolamento': 'Isolamento',
        // LAZER
        'Ferias': 'Férias', 'Viagem': 'Viagem', 'Encontro': 'Encontro', 'Passatempo': 'Passatempo',
        // TEMPO DE TELA (ATIVIDADE)
        'CelularRedeSocial': 'Celular/Rede Social', 'TV': 'TV', 'VideoGame': 'Video Game',
        // CICLO MENSTRUAL (FASE)
        'TPM': 'TPM', 'Menstruacao': 'Menstruação',
        
        // SUB-CATEGORIAS
        // DOR
        'SemDor': 'Sem Dor', 'DorCabeca': 'Dor de Cabeça', 'DorCostas': 'Dor nas Costas', 
        'DorArticulacoes': 'Dor nas Articulações', 'DorBarriga': 'Dor de Barriga',
        // TEMPO GASTO
        '1hMenos': '< 1h', '1a3h': '1 - 3h', '3a5h': '3 - 5h', '5hMais': '> 5h',
        // INTENSIDADE DO CICLO
        'Leve': 'Leve', 'Moderada': 'Moderada', 'Intensa': 'Intensa',
    };

    // Função auxiliar para buscar o label completo ou retornar o original
    const getLabel = (value) => FULL_VALUE_MAP[value] || value;
    
    // Lógica de Ícones
    const Icon = 
        record.category === 'Humor' ? Smile : 
        record.category === 'Sono' ? Bed : 
        record.category === 'Saude' ? Heart : 
        record.category === 'Vitalidade' ? Zap : 
        record.category === 'Social' ? User : 
        record.category === 'Lazer' ? Utensils :
        record.category === 'TempoDeTela' ? Star : 
        record.category === 'Ciclo' ? MessageSquare : 
        Zap; // Default

    const date = record.createdAt ? record.createdAt.toDate().toLocaleDateString('pt-BR') : 'Data Desconhecida';
    const time = record.createdAt ? record.createdAt.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    
    // 1. O título base agora usa a função getLabel
    let title = record.categoryValue ? getLabel(record.categoryValue) : record.category; 
    
    // 2. Adicionar informações adicionais, se existirem:
    
    // Adicionar a dor ao título se for Saúde
    if (record.category === 'Saude' && record.painValue) {
         const painText = getLabel(record.painValue);
         if (record.painValue !== 'SemDor') {
             title = `${title} (Com ${painText.toLowerCase()})`;
         } else {
             title = `${title} (${painText})`;
         }
    }
    
    // Adicionar Tempo Gasto se for TempoDeTela
    if (record.category === 'TempoDeTela' && record.screenTimeValue) {
        const timeLabel = getLabel(record.screenTimeValue);
        title = `${title} (${timeLabel})`;
    }

    // Adicionar Severidade do Ciclo se for Ciclo
    if (record.category === 'Ciclo' && record.severityValue) {
        const severityLabel = getLabel(record.severityValue);
        title = `${title} (Intensidade: ${severityLabel})`;
    }

    // Simplifica o conteúdo para a exibição na lista
    const summary = record.content.length > 50 ? record.content.substring(0, 50) + '...' : record.content;
    
    return (
        <div className={`p-4 rounded-xl shadow-md border-l-4 border-blue-600 bg-white transition-shadow duration-300 hover:shadow-lg flex items-center justify-between`}>
            <div className="flex-1">
                <div className="flex items-center mb-1">
                     <Icon className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-xs font-semibold uppercase text-gray-500">{record.category}</span>
                </div>
                 <p className="text-lg font-bold text-gray-800 mb-1">{title}</p>
                <p className="text-gray-700 leading-snug font-medium">
                    {summary}
                </p>
            </div>
            <div className="ml-4 text-right">
                <span className="text-xs text-gray-400 block">{date}</span>
                <span className="text-xs text-gray-500 block">{time}</span>
            </div>
        </div>
    );
};


// Componente: Tela de Histórico/Diário 
const HistoryPage = ({ setActiveView }) => {
    const { user, db } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('UltimaSemana'); 

    useEffect(() => {
        if (!user) return;

        setLoading(true);

        const recordsRef = collection(db, `users/${user.uid}/records`);
        const q = query(recordsRef, orderBy('createdAt', 'desc')); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRecords = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setRecords(fetchedRecords);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar registros:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, db]);
    
    const getFilteredRecords = () => {
        if (!records) return [];

        let days = 0;
        if (filter === 'UltimaSemana') days = 7;
        if (filter === '30Dias') days = 30;
        if (filter === 'TresMeses') days = 90;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        if (filter === 'Todos' || days === 0) return records; 

        return records.filter(record => 
            record.createdAt && record.createdAt.toDate() > cutoffDate
        );
    };

    const filteredRecords = getFilteredRecords();
    
    const filterTabs = [
        { id: 'UltimaSemana', label: 'Última Semana' },
        { id: '30Dias', label: '30 Dias' },
        { id: 'Todos', label: 'Todos' },
    ];


    return (
        <div className="p-4 pt-8 pb-20 max-w-lg mx-auto bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Diário</h2>
            </div>
            
            {/* Abas de Filtro de Histórico */}
            <div className="flex space-x-2 p-1 bg-gray-200 rounded-full mb-6">
                {filterTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`flex-1 text-sm py-2 rounded-full font-medium transition-colors duration-200 ${
                            filter === tab.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>


            {loading ? (
                <div className="p-8 text-center text-gray-500">Carregando diário...</div>
            ) : filteredRecords.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl shadow-lg mt-4">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Nada a Exibir</h3>
                    <p className="text-gray-500">Use o filtro ou adicione um novo registro.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRecords.map((record) => (
                        <RecordCard key={record.id} record={record} />
                    ))}
                </div>
            )}
            
        </div>
    );
};

// Componente: Card de Insight Simples
const InsightCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`p-4 rounded-xl shadow-lg bg-white border-l-4 ${colorClass}`}>
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <Icon className={`w-6 h-6 ${colorClass.replace('border', 'text')}`} />
        </div>
        <p className="text-3xl font-extrabold text-gray-800 mt-2">
            {value}
        </p>    
    </div>
);

// Função para calcular os insights
const calculateInsights = (records) => {
    if (!records || records.length === 0) {
        return {
            recordsLastWeek: 0,
            mostCommonSentiment: "Nenhum",
            sleepRecordsCount: 0,
        };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let recordsLastWeek = 0;
    const categoryCounts = {};

    records.forEach(record => {
        if (record.createdAt) {
            const recordDate = record.createdAt.toDate();

            // 1. Registros na Semana
            if (recordDate > sevenDaysAgo) {
                recordsLastWeek++;
            }

            // 2. Contagem de categorias
            const category = record.category || 'Outros';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
    });

    // 2. Sentimento Mais Comum
    let mostCommonCategory = 'Nenhum';
    let maxCount = 0;
    
    for (const category in categoryCounts) {
        if (categoryCounts[category] > maxCount) {
            maxCount = categoryCounts[category];
            mostCommonCategory = category;
        }
    }
    
    // 3. Registros de Sono
    const sleepRecordsCount = categoryCounts['Sono'] || 0;


    return {
        recordsLastWeek,
        mostCommonSentiment: mostCommonCategory,
        sleepRecordsCount,
    };
};


// Componente: Tela de Início (AGORA FUNCIONAL)
const HomePage = ({ setActiveView }) => {
    const { user, db } = useAuth();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        setLoading(true);

        const recordsRef = collection(db, `users/${user.uid}/records`);
        const q = query(recordsRef, orderBy('createdAt', 'desc')); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRecords = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const calculatedInsights = calculateInsights(fetchedRecords);
            setInsights(calculatedInsights);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar registros para insights:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, db]);
    
    // Configurações dinâmicas dos insights
    const insightData = insights ? [
        { 
            title: "Registros na Semana", 
            value: insights.recordsLastWeek.toString(), 
            icon: List, 
            colorClass: "border-blue-600" 
        },
        { 
            title: "Sua Categoria Mais Comum", 
            value: insights.mostCommonSentiment, 
            icon: Zap, 
            colorClass: "border-yellow-600" 
        },
        { 
            title: "Total de Registros de Sono", 
            value: insights.sleepRecordsCount.toString(), 
            icon: Bed, 
            colorClass: "border-indigo-600" 
        },
    ] : [];


    return (
        <div className="p-4 pt-8 pb-20 max-w-lg mx-auto bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
                <Home className="inline w-7 h-7 mr-2 text-blue-600" />
                Insights
            </h2>
            <p className="text-gray-600 mb-8">
                Um resumo rápido da sua jornada de bem-estar.
            </p>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Calculando insights...</div>
            ) : (
                <div className="space-y-4">
                    {insightData.map((insight, index) => (
                        <InsightCard 
                            key={index}
                            title={insight.title}
                            value={insight.value}
                            icon={insight.icon}
                            colorClass={insight.colorClass}
                        />
                    ))}
                </div>
            )}
            

            <h3 className="text-xl font-bold text-gray-700 mt-10 mb-4 border-t pt-4 border-gray-200">
                Ações Rápidas
            </h3>
            
            {/* Botão para Novo Registro */}
            <button
                onClick={() => setActiveView('new')}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center space-x-2 mb-3"
            >
                <Plus className="w-5 h-5" />
                <span>Adicionar Novo Registro</span>
            </button>
            
             {/* Botão para Diário Completo */}
            <button
                onClick={() => setActiveView('history')}
                className="w-full py-4 bg-gray-200 text-gray-800 font-semibold rounded-xl shadow-md hover:bg-gray-300 transition duration-300 flex items-center justify-center space-x-2"
            >
                <List className="w-5 h-5" />
                <span>Ver Diário Completo</span>
            </button>
            
        </div>
    );
};


// Componente: Tela de Bem-Estar 
const BemEstarPage = () => {
    
    // Conteúdo estático de exemplo
    const supportResources = [
        { name: "CVV - Centro de Valorização da Vida", link: "https://www.cvv.org.br", phone: "Ligue 188", icon: MessageSquare },
        { name: "Psy Meet", link: "https://www.psymeet.com.br", phone: "Plataforma de psicólogos", icon: User },
    ];
    
    // 1. LISTA DE DICAS COM NOVAS OPÇÕES
    const dailyTips = [
        { 
            title: "Pausa Consciente", 
            content: "Reserve 5 minutos para uma pausa consciente: Feche os olhos, perceba a respiração e identifique 3 coisas pelas quais você é grato."
        },
        { 
            title: "Movimente-se", 
            content: "Faça uma caminhada de 15 minutos ou realize alongamentos leves. O movimento melhora o humor e a clareza mental."
        },
        { 
            title: "Respire Fundo", 
            content: "Faça 10 respirações profundas, inspirando pelo nariz e expirando pela boca. Isso acalma o sistema nervoso."
        },
        { 
            title: "Escreva", 
            content: "Gaste 10 minutos escrevendo livremente sobre o que está em sua mente, sem censura ou julgamento. O ato de escrever ajuda a organizar os pensamentos."
        },
        { 
            title: "Estabeleça Limites", 
            content: "Pratique dizer 'não' a um pedido que sobrecarregaria sua agenda. Proteger seu tempo é uma forma crucial de autocuidado."
        },
        { 
            title: "Conecte-se", 
            content: "Mande uma mensagem ou ligue para um amigo ou familiar que você não fala há um tempo. Conexões sociais nutrem o bem-estar."
        },
    ];

    // 2. ESTADO E INICIALIZAÇÃO ALEATÓRIA
    const [currentTip, setCurrentTip] = useState(
        dailyTips[Math.floor(Math.random() * dailyTips.length)]
    );
    
    // 3. FUNÇÃO PARA SORTEAR UMA NOVA DICA
    const getNewTip = () => {
        let newTipIndex;
        let attempts = 0;
        const maxAttempts = 5;
        const currentTipTitle = currentTip.title;

        do {
            newTipIndex = Math.floor(Math.random() * dailyTips.length);
            attempts++;
            // Tenta garantir que a nova dica não seja a mesma, se houver mais de uma
        } while (dailyTips[newTipIndex].title === currentTipTitle && dailyTips.length > 1 && attempts < maxAttempts);

        setCurrentTip(dailyTips[newTipIndex]);
    };


    return (
        <div className="p-4 pt-8 pb-20 max-w-lg mx-auto bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <Heart className="inline w-6 h-6 mr-2 text-red-500" />
                Bem-Estar
            </h2>
            <p className="text-gray-600 mb-8">
                Dicas e recursos para cuidar da sua saúde mental.
            </p>

            {/* Dica do Dia (AGORA DINÂMICA) */}
            <section className="bg-white p-6 rounded-xl shadow-xl mb-8 border-l-4 border-yellow-400">
                <h3 className="text-xl font-bold text-yellow-700 mb-3">{currentTip.title}</h3>
                <p className="text-gray-700 italic mb-4">{currentTip.content}</p>
                
                <button
                    onClick={getNewTip} // Conexão com a nova função
                    className="text-blue-600 font-semibold hover:underline"
                >
                    Nova Dica
                </button>
            </section>

            {/* Recursos de Apoio */}
            <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Recursos de Apoio</h3>
                <div className="space-y-3">
                    {supportResources.map((resource, index) => (
                        <a 
                            key={index}
                            href={resource.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-green-500"
                        >
                            <resource.icon className="w-6 h-6 mr-3 text-green-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{resource.name}</p>
                                <p className="text-sm text-gray-500">{resource.phone}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
};


// --- 3. COMPONENTE PRINCIPAL ---

const App = () => {
    
    // Controla se o usuário já viu a tela de introdução (persiste localmente)
    const [hasSeenIntro, setHasSeenIntro] = useState(() => {
        const saved = localStorage.getItem('confessai_intro_seen');
        return saved === 'true';
    });

    // Controla a view atual: 'home', 'new', 'history', 'wellness', 'settings'
    const [activeView, setActiveView] = useState('home');
    const { user } = useAuth(); 


    let content;

    if (!hasSeenIntro) {
        content = <IntroPage onAccept={() => {
            setHasSeenIntro(true);
            localStorage.setItem('confessai_intro_seen', 'true');
        }} />;
    } else if (!user) {
        content = <LoginPage />;
    } else {
        // Se estiver logado, mostra a navegação e a view ativa
        switch (activeView) {
            case 'home':
                content = <HomePage setActiveView={setActiveView} />; 
                break;
            case 'new':
                content = <NewRegistrationPage setActiveView={setActiveView} />;
                break;
            case 'history':
                content = <HistoryPage setActiveView={setActiveView} />;
                break;
            case 'wellness':
                content = <BemEstarPage />;
                break;
            case 'settings':
                content = <SettingsPage />; 
                break;
            default:
                // Default para a nova HomePage
                content = <HomePage setActiveView={setActiveView} />; 
        }
    }

    return (
        <div className="flex flex-col min-h-screen font-sans">
            <main className="flex-grow">
                {content}
            </main>
            {/* Renderiza a navegação apenas se o usuário estiver logado e tiver visto a intro */}
            {hasSeenIntro && user && (
                 <Navigation activeView={activeView} setActiveView={setActiveView} />
            )}
        </div>
    );
};

// Componente Wrapper para fornecer o contexto de autenticação
const ConfessaiApp = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default ConfessaiApp;