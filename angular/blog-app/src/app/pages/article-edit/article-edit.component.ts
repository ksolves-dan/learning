import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { ArticleService, Article } from '../../services/article.service';
import { RichTextEditorComponent } from '../../utils/rich-text-editor/rich-text-editor.component';
import { catchError, of, Observable } from 'rxjs';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RichTextEditorComponent],
  templateUrl: './article-edit.component.html',
})
export class ArticleEditComponent implements OnInit {
  articleForm: FormGroup;
  isLoading = false;
  isNewArticle = true;
  articleId: string = '';

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      content: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isNewArticle = false;
        this.articleId = id.toString();
        this.loadArticle(this.articleId);
      }
    });
  }

  loadArticle(id: string | null): void {
    if (id) {
      this.articleService.getArticle(id)
        .pipe(
          catchError(error => {
            console.error('Error loading article', error);
            return of(null);
          })
        )
        .subscribe(article => {
          if (article) {
            this.articleForm.patchValue({
              title: article.title,
              description: article.description,
              content: article.content
            });
          }
        });
    }
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const articleData = {
      title: this.articleForm.get('title')?.value,
      description: this.articleForm.get('description')?.value,
      content: this.articleForm.get('content')?.value
    };

    let saveObservable: Observable<Article | null>;

    if (this.isNewArticle) {
      saveObservable = this.articleService.createArticle(articleData);
    } else if (this.articleId) {
      saveObservable = this.articleService.updateArticle(this.articleId, articleData);
    } else {
      saveObservable = of(null);
    }

    saveObservable
      .pipe(
        catchError(error => {
          console.error('Error saving article', error);
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(response => {
        this.isLoading = false;
        if (response) {
          this.router.navigate(['/blogs']);
        }
      });
  }
}