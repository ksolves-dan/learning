import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  tags: string[];
  isApproved: boolean;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  user: string;
  content: string;
  createdAt: string;
  replies: Reply[];
}

interface Reply {
  _id: string;
  user: string;
  content: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${environment.apiUrl}/articles`).pipe(
      tap(articles => console.log('Fetched articles:', articles)),
      catchError(this.handleError)
    );
  }

  getArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${environment.apiUrl}/articles/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createArticle(articleData: Omit<Article, '_id' | 'author' | 'createdAt' | 'updatedAt' | 'isApproved' | 'comments'>): Observable<Article> {
    return this.http.post<Article>(`${environment.apiUrl}/articles`, articleData).pipe(
      catchError(this.handleError)
    );
  }

  updateArticle(id: string, articleData: Partial<Article>): Observable<Article> {
    return this.http.put<Article>(`${environment.apiUrl}/articles/${id}`, articleData).pipe(
      catchError(this.handleError)
    );
  }

  deleteArticle(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/articles/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  approveArticle(id: string): Observable<Article> {
    return this.http.put<Article>(`${environment.apiUrl}/articles/${id}/approve`, {}).pipe(
      catchError(this.handleError)
    );
  }

  addComment(articleId: string, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${environment.apiUrl}/articles/${articleId}/comments`, { content }).pipe(
      catchError(this.handleError)
    );
  }

  addReply(articleId: string, commentId: string, content: string): Observable<Reply> {
    console.log(`Adding reply to article ${articleId}, comment ${commentId}`);
    return this.http.post<Reply>(`${environment.apiUrl}/articles/${articleId}/comments/${commentId}/replies`, { content }).pipe(
      tap(reply => console.log('Reply added:', reply)),
      catchError(this.handleError)
    );
  }
}

