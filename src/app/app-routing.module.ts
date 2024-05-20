import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard'; // Asegúrate de importar el AuthGuard aquí

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard
  },
  {
    path: 'order-details',
    loadChildren: () => import('./pages/order-details/order-details.module').then( m => m.OrderDetailsPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard
  },
  {
    path: 'work-details',
    loadChildren: () => import('./pages/workDetails/work-details/work-details.module').then( m => m.WorkDetailsPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard
  },



  {
    path: 'horario-details',
    loadChildren: () => import('./pages/horario-details/horario-details.module').then( m => m.HorarioDetailsPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard
  },
  {
    path: 'finalizar',
    loadChildren: () => import('./pages/finalizar/finalizar.module').then( m => m.FinalizarPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard
  },
  {
    path: 'stock',
    loadChildren: () => import('./pages/stock/stock.module').then( m => m.StockPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard

  },
  {
    path: 'cam',
    loadChildren: () => import('./pages/cam/cam.module').then( m => m.CamPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard

  },
  {
    path: 'stock-detail',
    loadChildren: () => import('./pages/stock-detail/stock-detail.module').then( m => m.StockDetailPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard

  },
  {
    path: 'add-pedido',
    loadChildren: () => import('./pages/add-pedido/add-pedido.module').then( m => m.AddPedidoPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard

  },
  {
    path: 'select-client',
    loadChildren: () => import('./pages/select-client/select-client.module').then( m => m.SelectClientPageModule),
    canActivate: [AuthGuard] // Protege esta ruta con el AuthGuard

  },
  {
    path: 'select-product',
    loadChildren: () => import('./pages/select-product/select-product.module').then( m => m.SelectProductPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}