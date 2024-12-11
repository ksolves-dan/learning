import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Article, ArticleService } from '../../services/article.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-article-view',
  standalone: true,
  imports: [NgIf],
  templateUrl: './article-view.component.html',
})
export class ArticleViewComponent implements OnInit {
  article: Article | null = null;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadArticle(id);
      }
    });
  }

  loadArticle(id: string): void {
    this.articleService.getArticle(id).subscribe({
      next: (article) => {
        // Explicitly handle potential undefined
        this.article = article || null;
      },
      error: (error) => {
        console.error('Error loading article', error);
        this.article = null;
      }
    });
  }
}