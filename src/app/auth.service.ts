import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { dadosLogin } from "./app" 


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private http: HttpClient) { }

    fazerLogin(dados: dadosLogin): Observable<any> {
        return import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password }); 
  if (error) throw error;
  return data;
}
    }
}

