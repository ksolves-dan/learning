import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';

interface Article {
  _id: string;
  title: string;
  description: string;
  content: string
  author: string;
  tags: string[];
  isApproved: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule, DatePipe, ConfirmationModalComponent],
  templateUrl: './article-list.component.html',
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;
  error: string | null = null;
  isDeleteModalOpen: boolean = false;
  articleToDelete: Article | null = null;

  constructor(
    private articleService: ArticleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isAuthor(article: Article): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser !== null && article.author === currentUser._id;
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;
    this.articleService.getArticles().subscribe({
      next: (articles: Article[]) => {
        this.articles = articles;
        this.filteredArticles = this.isAdmin ? articles : articles.filter(a => a.isApproved);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading articles', error);
        this.error = 'Failed to load articles. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.filteredArticles = this.articles.filter(article =>
      (article.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (this.isAdmin || article.isApproved)
    );
  }

  openDeleteModal(article: Article): void {
    this.articleToDelete = article;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.articleToDelete = null;
  }

  confirmDelete(): void {
    if (this.articleToDelete) {
      this.deleteArticle(this.articleToDelete._id);
      this.closeDeleteModal();
    }
  }

  deleteArticle(id: string): void {
    this.articleService.deleteArticle(id).subscribe({
      next: () => {
        this.articles = this.articles.filter(article => article._id !== id);
        this.onSearch();
      },
      error: (error: any) => {
        console.error('Error deleting article', error);
        this.error = 'Failed to delete the article. Please try again.';
      }
    });
  }

  approveArticle(id: string): void {
    this.articleService.approveArticle(id).subscribe({
      next: (updatedArticle) => {
        const index = this.articles.findIndex(a => a._id === id);
        if (index !== -1) {
          this.articles[index] = updatedArticle;
          this.onSearch();
        }
      },
      error: (error: any) => {
        console.error('Error approving article', error);
        this.error = 'Failed to approve the article. Please try again.';
      }
    });
  }
}

