// article-list.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';

interface Article {
  id: string;
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
  
  // Track loading states for individual articles
  loadingStates = {
    deleting: new Set<string>(),
    approving: new Set<string>()
  };

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
    return currentUser !== null && article.author === currentUser.id;
  }

  isDeleting(articleId: string): boolean {
    return this.loadingStates.deleting.has(articleId);
  }

  isApproving(articleId: string): boolean {
    return this.loadingStates.approving.has(articleId);
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
      this.deleteArticle(this.articleToDelete.id);
      this.closeDeleteModal();
    }
  }

  deleteArticle(id: string): void {
    this.loadingStates.deleting.add(id);
    
    this.articleService.deleteArticle(id).subscribe({
      next: () => {
        this.articles = this.articles.filter(article => article.id !== id);
        this.onSearch();
        this.loadingStates.deleting.delete(id);
      },
      error: (error: any) => {
        console.error('Error deleting article', error);
        this.error = 'Failed to delete the article. Please try again.';
        this.loadingStates.deleting.delete(id);
      }
    });
  }

  approveArticle(id: string): void {
    this.loadingStates.approving.add(id);
    
    this.articleService.approveArticle(id).subscribe({
      next: (updatedArticle) => {
        const index = this.articles.findIndex(a => a.id === id);
        if (index !== -1) {
          this.articles[index] = updatedArticle;
          this.onSearch();
        }
        this.loadingStates.approving.delete(id);
      },
      error: (error: any) => {
        console.error('Error approving article', error);
        this.error = 'Failed to approve the article. Please try again.';
        this.loadingStates.approving.delete(id);
      }
    });
  }
}