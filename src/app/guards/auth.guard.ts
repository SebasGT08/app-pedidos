import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private storageService: StorageService
    ) {

    }

    async canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Promise<boolean> {
      const user = await this.storageService.getCurrentUser();
      //console.log('Current user:', user); // Agrega esta línea para depurar

      if (user.key == 'true') {
        return true;
      }

      
        this.router.navigate(['/login']);
        return false;
      
      
    }

}
