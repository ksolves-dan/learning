import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  template: `
    <div class="rich-text-editor">
      <div class="toolbar border border-gray-600 rounded-t-md p-2 bg-primary flex flex-wrap gap-2">
        <button type="button" (click)="execCommand('bold')" class="p-1 hover:bg-accent/20 rounded">
          <strong>B</strong>
        </button>
        <button type="button" (click)="execCommand('italic')" class="p-1 hover:bg-accent/20 rounded">
          <em>I</em>
        </button>
        <button type="button" (click)="execCommand('underline')" class="p-1 hover:bg-accent/20 rounded">
          <u>U</u>
        </button>
        <button type="button" (click)="execCommand('insertUnorderedList')" class="p-1 hover:bg-accent/20 rounded">
          • List
        </button>
        <button type="button" (click)="execCommand('insertOrderedList')" class="p-1 hover:bg-accent/20 rounded">
          1. List
        </button>
        <button type="button" (click)="execCommand('createLink', true)" class="p-1 hover:bg-accent/20 rounded">
          Link
        </button>
      </div>
      <div
        #editor
        class="editor-content bg-primary border border-t-0 border-gray-600 rounded-b-md p-2 min-h-[200px]"
        contenteditable="true"
        (input)="onContentChange($event)"
      ></div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent implements ControlValueAccessor {
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    const editorElement = document.querySelector('.editor-content') as HTMLElement;
    if (editorElement) {
      editorElement.innerHTML = value || '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onContentChange(event: Event): void {
    const content = (event.target as HTMLElement).innerHTML;
    this.onChange(content);
    this.onTouched();
  }

  execCommand(command: string, showUI: boolean = false, value: string | undefined = undefined): void {
    document.execCommand(command, showUI, value ?? '');
    
    // If it's a link command, handle it specially
    if (command === 'createLink' && showUI) {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    }
    
    // Trigger change detection with a proper InputEvent
    const editorElement = document.querySelector('.editor-content') as HTMLElement;
    if (editorElement) {
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: editorElement.innerHTML
      });
      editorElement.dispatchEvent(inputEvent);
    }
  }
}