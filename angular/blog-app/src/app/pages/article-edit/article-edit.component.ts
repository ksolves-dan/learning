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
  templateUrl: './article-edit.component.html',
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
      
      // Get form values
      const formValues = { ...this.articleForm.value };
      
      let processedTags: string[] = [];
      
      if (formValues.tags) {
        processedTags = formValues.tags.map((tag: any) => {
          if (typeof tag === 'string') return tag;
          if (typeof tag === 'object') return tag.value || tag.display || tag;
          return tag;
        }).filter((tag: any) => tag); // Remove any undefined/null values
      }

      const articleData = {
        ...formValues,
        tags: processedTags
      };
      const request = this.isNewArticle
        ? this.articleService.createArticle(articleData)
        : this.articleService.updateArticle(this.articleId as string, articleData);

      request.subscribe({
        next: (response) => {
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
    } else {
      console.log('Form is invalid:', this.articleForm.errors);
    }
  }
}

