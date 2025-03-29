// src/app/pipes/shorten-id.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenId',
  standalone: true
})
export class ShortenIdPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.substring(0, 8) + '...';
  }
}