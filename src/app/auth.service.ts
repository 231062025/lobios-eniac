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
        // signInWithPassword devolve uma Promise; from() converte pra Observable,
        // mantendo o mesmo tipo de retorno que o resto do app já espera
        const resultado = supabase.auth.signInWithPassword({
            email: dados.login,
            password: dados.senha
        });

        return from(resultado);
    }
}
