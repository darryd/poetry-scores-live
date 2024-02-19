import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { IsAuthenticatedService } from './is-authenticated.service';

@Injectable()
export class AddAuthorizationHeader implements HttpInterceptor {

    constructor(private isAuthenticatedService: IsAuthenticatedService) { }

    getAccessToken() {
        try {
            var isAuthenticated = this.isAuthenticatedService.isAuthenticated

            if (isAuthenticated) {
                var accessToken = this.isAuthenticatedService.accessToken
                return accessToken
            } else {
                return undefined
            }

        } catch (error) {
            console.error(error)
            return undefined
        }
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var modified
        var accessToken = this.getAccessToken()
        if (accessToken) {
            modified = req.clone({ setHeaders: { 'Authorization': `Bearer ${accessToken}` } });
        }
        else {
            modified = req.clone()
        }
        
        return next.handle(modified)
    }
}
