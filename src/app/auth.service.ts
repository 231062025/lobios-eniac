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
        return this.http.post('https://localhost:3001/login', dados);
    }
}

