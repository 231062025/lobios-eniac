import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

/**
 * Firebase só é usado depois do login real (Supabase). A ponte é:
 *   Supabase access_token -> POST /auth/firebase-token (API) -> custom token
 *   -> signInWithCustomToken. O UID no Firebase é o mesmo UUID do Supabase.
 *
 * O SDK é carregado sob demanda (import dinâmico) para não pesar na
 * primeira abertura do site, antes mesmo do login.
 */
interface Conexao { auth: Auth; db: Firestore; }
let conexao: Promise<Conexao> | null = null;

export const firebaseConfigurado = !!environment.firebase.apiKey;

function conectar(): Promise<Conexao> {
  conexao ??= (async () => {
    const [{ initializeApp }, { getAuth }, { getFirestore }] = await Promise.all([
      import('firebase/app'), import('firebase/auth'), import('firebase/firestore'),
    ]);
    const app = initializeApp(environment.firebase);
    return { auth: getAuth(app), db: getFirestore(app) };
  })();
  return conexao;
}

/** Troca a sessão do Supabase por uma sessão do Firebase. */
export async function entrarNoFirebase(accessTokenSupabase: string): Promise<void> {
  if (!firebaseConfigurado) return;
  const resposta = await fetch(`${environment.apiUrl}/auth/firebase-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessTokenSupabase}` },
  });
  if (!resposta.ok) throw new Error(`A API recusou o token (${resposta.status}).`);
  const { token } = (await resposta.json()) as { token: string };
  const [{ auth }, { signInWithCustomToken }] = await Promise.all([conectar(), import('firebase/auth')]);
  await signInWithCustomToken(auth, token);
}

export async function sairDoFirebase(): Promise<void> {
  if (!firebaseConfigurado || !conexao) return;
  const [{ auth }, { signOut }] = await Promise.all([conectar(), import('firebase/auth')]);
  if (auth.currentUser) await signOut(auth);
}

/**
 * Devolve o Firestore quando dá para usá-lo em nome deste usuário; senão null
 * (modo demonstração). Espera o Firebase restaurar a sessão salva (após um F5).
 */
export async function firestorePara(usuarioId: string): Promise<Firestore | null> {
  if (!firebaseConfigurado) return null;
  const { auth, db } = await conectar();
  await auth.authStateReady();
  return auth.currentUser?.uid === usuarioId ? db : null;
}

/** Traduz os erros mais comuns do Firestore. */
export function mensagemFirebase(erro: unknown): string {
  const codigo = (erro as { code?: string })?.code ?? '';
  if (codigo === 'permission-denied') return 'O Firestore recusou a operação: as regras de segurança não permitem isso para o seu perfil.';
  if (codigo === 'unavailable') return 'Sem conexão com o Firestore. Verifique a internet e tente de novo.';
  if (codigo === 'not-found') return 'Registro não encontrado no Firestore.';
  return erro instanceof Error ? erro.message : 'Erro ao acessar o Firestore.';
}
