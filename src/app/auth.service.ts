import { Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
import { createClient } from "@supabase/supabase-js";
import { dadosLogin } from "./app";
import { environment } from "../environments/environment";

// Cliente do Supabase — criado uma vez, fora da classe
const supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    fazerLogin(dados: dadosLogin): Observable<any> {
        const resultado = supabase.auth.signInWithPassword({
            email: dados.login,
            password: dados.senha
        });

        return from(resultado);
    }

    // Busca o tipo_perfil do usuário logado, pra decidir pra onde navegar
    buscarPerfil(userId: string): Observable<any> {
        const resultado = supabase
            .from('usuarios')
            .select('tipo_perfil')
            .eq('id', userId)
            .single();

        return from(resultado);
    }
}
