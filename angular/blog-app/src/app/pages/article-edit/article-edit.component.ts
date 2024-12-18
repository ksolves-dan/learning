import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { ArticleService } from '../../services/article.service';
import { RichTextEditorComponent } from '../../utils/rich-text-editor/rich-text-editor.component';
import { TagInputModule } from 'ngx-chips';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RichTextEditorComponent, TagInputModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">{{ isNewArticle ? 'Create' : 'Edit' }} Blog</h2>
      <form [formGroup]="articleForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium mb-1">Title</label>
          <input type="text" id="title" formControlName="title" class="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent">
        </div>
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium mb-1">Description</label>
          <textarea id="description" formControlName="description" rows="3" class="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent"></textarea>
        </div>
        <div class="mb-4">
          <label for="tags" class="block text-sm font-medium mb-1">Tags</label>
          <tag-input formControlName="tags"></tag-input>
        </div>
        <div class="mb-6">
          <label for="content" class="block text-sm font-medium mb-1">Content</label>
          <app-rich-text-editor formControlName="content"></app-rich-text-editor>
        </div>
        <button type="submit" [disabled]="articleForm.invalid || isLoading" class="w-full bg-accent text-white py-2 px-4 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
          {{ isLoading ? 'Saving...' : (isNewArticle ? 'Create' : 'Update') }}
        </button>
      </form>
    </div>
  `,
})
export class ArticleEditComponent implements OnInit {
  articleForm: FormGroup;
  isLoading = false;
  isNewArticle = true;
  articleId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      content: ['', [Validators.required]],
      tags: [[]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isNewArticle = false;
        this.articleId = params['id'];
        this.loadArticle(this.articleId);
      }
    });
  }

  loadArticle(id: string | null): void {
    if (id) {
      this.articleService.getArticle(id).subscribe({
        next: (article) => {
          this.articleForm.patchValue({
            ...article,
            tags: article.tags.map(tag => ({ display: tag, value: tag }))
          });
        },
        error: (error) => {
          console.error('Error loading article', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.articleForm.valid) {
      this.isLoading = true;
      const articleData = {
        ...this.articleForm.value,
        tags: this.articleForm.value.tags.map((tag: { display: string }) => tag.display)
      };
      
      const request = this.isNewArticle
        ? this.articleService.createArticle(articleData)
        : this.articleService.updateArticle(this.articleId as string, articleData);

      request.subscribe({
        next: () => {
          this.router.navigate(['/blogs']);
        },
        error: (error) => {
          console.error('Error saving article', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}

