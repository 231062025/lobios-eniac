/**
 * Configurações do front.
 *
 * supabaseAnonKey: copie em Supabase > Project Settings > API Keys > "anon public".
 *   - Preenchida  -> login de verdade (Supabase Auth, e-mail + senha) e Firestore ligado.
 *   - Vazia       -> "modo demonstração": entra só com o e-mail de um usuário
 *                    que já existe na API e escolhe o perfil na tela de login.
 *                    Ponto e treinamentos ficam salvos no navegador.
 *
 * firebase: copiado do console do Firebase (app Web "Lobios Teste").
 *
 * As duas chaves podem ficar no front: são públicas por definição. Quem protege
 * os dados são a RLS do Supabase e as regras do Firestore.
 * NUNCA coloque aqui a service_role key do Supabase nem o JSON da conta de serviço do Firebase.
 */
export const environment = {
  apiUrl: 'https://lobios-api.onrender.com',
  supabaseUrl: 'https://ocdyqvuufmgkcnbtopbn.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZHlxdnV1Zm1na2NuYnRvcGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3ODc5ODQsImV4cCI6MjEwMzM2Mzk4NH0.fmwAAiHVSHq4ImpDzYfEtE4CFTWbRabp77VlpIHk0zk',
  firebase: {
    apiKey: 'AIzaSyAVr4I-NGxHYyeQDJw8PJCODcB91YZvU-Y',
    authDomain: 'lobios-eniac.firebaseapp.com',
    projectId: 'lobios-eniac',
    storageBucket: 'lobios-eniac.firebasestorage.app',
    messagingSenderId: '600231979148',
    appId: '1:600231979148:web:c8cd388439f0bf2c79f3a9',
  },
};
