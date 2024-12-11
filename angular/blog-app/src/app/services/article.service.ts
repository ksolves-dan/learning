import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  constructor(private http: HttpClient) {}

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${environment.apiUrl}/articles`);
  }

  getArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${environment.apiUrl}/articles/${id}`);
  }

  createArticle(articleData: Omit<Article, '_id' | 'author' | 'createdAt' | 'updatedAt'>): Observable<Article> {
    return this.http.post<Article>(`${environment.apiUrl}/articles`, articleData);
  }

  updateArticle(id: string, articleData: Partial<Article>): Observable<Article> {
    return this.http.put<Article>(`${environment.apiUrl}/articles/${id}`, articleData);
  }

  deleteArticle(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/articles/${id}`);
  }
}