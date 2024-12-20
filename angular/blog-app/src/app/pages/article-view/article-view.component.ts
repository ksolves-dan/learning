import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Article, ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-article-view',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, DatePipe],
  templateUrl: './article-view.component.html',
})
export class ArticleViewComponent implements OnInit {
  article: Article | null = null;
  commentForm: FormGroup;
  replyForms: { [key: string]: FormGroup } = {};
  showCommentInput = false;
  replyInputs: { [commentId: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadArticle(params['id']);
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  loadArticle(id: string): void {
    this.articleService.getArticle(id).subscribe({
      next: (article) => {
        this.article = article;
        // Initialize reply forms for each comment
        this.article.comments.forEach(comment => {
          this.initReplyForm(comment._id);
        });
      },
      error: (error) => {
        console.error('Error loading article', error);
      },
    });
  }

  initReplyForm(commentId: string): void {
    this.replyForms[commentId] = this.fb.group({
      content: ['', Validators.required],
    });
  }

  toggleCommentInput(): void {
    this.showCommentInput = !this.showCommentInput;
    if (!this.showCommentInput) {
      this.commentForm.reset();
    }
  }

  toggleReplyInput(commentId: string): void {
    if (!this.replyForms[commentId]) {
      this.initReplyForm(commentId);
    }
    this.replyInputs[commentId] = !this.replyInputs[commentId];
    if (!this.replyInputs[commentId]) {
      this.replyForms[commentId].reset();
    }
  }

  addComment(): void {
    if (this.commentForm.valid && this.article) {
      this.articleService.addComment(this.article._id, this.commentForm.value.content).subscribe({
        next: (comment) => {
          if (this.article) {
            this.article.comments.push(comment);
            this.initReplyForm(comment._id);
            this.commentForm.reset();
            this.showCommentInput = false;
          }
        },
        error: (error) => {
          console.error('Error adding comment', error);
        },
      });
    }
  }

  addReply(commentId: string): void {
    const replyForm = this.replyForms[commentId];
    if (replyForm && replyForm.valid && this.article) {
      this.articleService.addReply(
        this.article._id,
        commentId,
        replyForm.value.content
      ).subscribe({
        next: (reply) => {
          const comment = this.article?.comments.find((c) => c._id === commentId);
          if (comment) {
            comment.replies.push(reply);
            replyForm.reset();
            this.replyInputs[commentId] = false;
          }
        },
        error: (error) => {
          console.error('Error adding reply', error);
        },
      });
    }
  }
}

