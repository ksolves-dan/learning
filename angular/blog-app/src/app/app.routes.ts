import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { ArticleListComponent } from './pages/article-list/article-list.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ArticleEditComponent } from './pages/article-edit/article-edit.component';
import { ArticleViewComponent } from './pages/article-view/article-view.component';
import { ContactComponent } from './pages/contact/contact.component';

export const routes: Routes = [
  { path: '', redirectTo: '/blogs', pathMatch: 'full' },
  { path: 'blogs', component: ArticleListComponent },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'register', component: SignupComponent, canActivate: [LoginGuard] },
  { path: 'add-blog', component: ArticleEditComponent, canActivate: [AuthGuard] },
  { path: 'edit-blog/:id', component: ArticleEditComponent, canActivate: [AuthGuard] },
  { path: 'view-blog/:id', component: ArticleViewComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '/blogs' }
];

export default routes;

