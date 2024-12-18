import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';

interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  tags: string[];
  comments: Comment[];
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

@Component({
  selector: 'app-article-view',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, DatePipe],
  templateUrl: './article-view.component.html',
})
export class ArticleViewComponent implements OnInit {
  article: Article | null = null;
  commentForm: FormGroup;
  replyForm: FormGroup;
  showCommentInput = false; // Toggle for comment form visibility
  replyInputs: { [commentId: string]: boolean } = {}; // Toggle for reply forms visibility

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', Validators.required],
    });

    this.replyForm = this.fb.group({
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
      },
      error: (error) => {
        console.error('Error loading article', error);
      },
    });
  }

  toggleCommentInput(): void {
    this.showCommentInput = !this.showCommentInput;
  }

  toggleReplyInput(commentId: string): void {
    this.replyInputs[commentId] = !this.replyInputs[commentId];
  }

  addComment(): void {
    if (this.commentForm.valid && this.article) {
      this.articleService.addComment(this.article._id, this.commentForm.value.content).subscribe({
        next: (comment) => {
          this.article!.comments.push(comment);
          this.commentForm.reset();
          this.showCommentInput = false; // Hide the comment input after submission
        },
        error: (error) => {
          console.error('Error adding comment', error);
        },
      });
    }
  }

  addReply(commentId: string): void {
    if (this.replyForm.valid && this.article) {
      this.articleService.addReply(this.article._id, commentId, this.replyForm.value.content).subscribe({
        next: (reply) => {
          const comment = this.article!.comments.find((c) => c._id === commentId);
          if (comment) {
            comment.replies.push(reply);
          }
          this.replyForm.reset();
          this.replyInputs[commentId] = false; // Hide the reply input after submission
        },
        error: (error) => {
          console.error('Error adding reply', error);
        },
      });
    }
  }
}
