import { Component, OnInit, AfterViewInit, ViewChild,ElementRef } from '@angular/core';
import { fromEvent, from, of, Observable, interval, timer } from 'rxjs'; 
import { debounceTime, map, mapTo,filter, distinctUntilChanged, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements AfterViewInit {
  name = '';
  // public input = document.querySelector('input');
  // public ul = document.querySelector('ul');
  @ViewChild('userName', {static: false}) input: ElementRef;
  @ViewChild('userList', {static: false}) ul: ElementRef;

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
    // let inputValue = event.target as HTMLInputElement;
    fromEvent(this.input.nativeElement, 'keyup').pipe(
      debounceTime(700),
      map(event => event.target.value),
      filter(val => val.length > 2),
      distinctUntilChanged(),
      // map(value => this.getUsersRepsFromAPI(value)) // return promise
      switchMap(value => from(this.getUsersRepsFromAPI(value))) 
    ).subscribe({
      // next: promise => promise.then(reps => this.recordRepsToList(reps)) // handling promise
      next: reps => this.recordRepsToList(reps),
      error: console.log
    });
  }

  public getUsersRepsFromAPI = (username) => {
    const url = `https://api.github.com/users/${ username }/repos`;
    console.log(url);
    return fetch(url)
      .then(response => {
        if(response.ok) {
          return response.json();
        }
        throw new Error('Ошибка');
      });
    // return promise
  }

  public recordRepsToList = (reps) => {
    for (let i = 0; i < reps.length; i++) {
    
      // если элемент не существует, то создаем его
      if (!this.ul.nativeElement.children[i]) {
        const newEl = document.createElement('li');
        this.ul.nativeElement.appendChild(newEl);
      }
      // записываем название репозитория в элемент
      const li = this.ul.nativeElement.children[i];
      li.innerHTML = reps[i].name;
    }
    // удаляем оставшиеся элементы
    while (this.ul.nativeElement.children.length > reps.length) {
      this.ul.nativeElement.removeChild(this.ul.nativeElement.lastChild);
    }
  }
}
