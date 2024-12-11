import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';

interface Article {
  _id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
}

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule],
  templateUrl: './article-list.component.html',
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  searchTerm: string = '';

  constructor(private articleService: ArticleService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  loadArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.filteredArticles = articles;
      },
      error: (error) => {
        console.error('Error loading articles', error);
      }
    });
  }

  onSearch(): void {
    this.filteredArticles = this.articles.filter(article =>
      article.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  deleteArticle(id: string): void {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.articles = this.articles.filter(article => article._id !== id);
          this.onSearch(); // Reapply search filter
        },
        error: (error) => {
          console.error('Error deleting article', error);
        }
      });
    }
  }
}

