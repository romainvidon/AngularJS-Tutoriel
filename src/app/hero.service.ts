import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


import { Hero } from './hero';
import { HEROES } from './mock-heroes';
import { MessageService } from './message.service';


@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroesUrl = 'api/heroes';
  private httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(
    private messageService: MessageService,
    private http: HttpClient,  
  ) { }

  private log(message: string){
    this.messageService.add(message);
  }

  getHeroes(): Observable<Hero[]>{
    
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log("HeroService : héros récupérés")),
        catchError(this.handleError<Hero[]>('getHeroes',[]))
      );
  }

  getHero(id: number): Observable<Hero>{
    
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`HeroService: récupéré héros n°${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    )
    
  }

  handleError<T>(operation = 'operation', result? : T){
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} a échoué : ${error.message}`);
      return of(result as T);
    };
  }

  updateHero(hero: Hero){
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
        tap(_ => this.log(`Mis à jour le héro n° ${hero.id}`)),
        catchError(this.handleError<any>('updateHero'))
      )
  }

  addHero(hero: Hero): Observable<Hero>{
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`Ajouté un héros, id = ${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    )
  }

  deleteHero(hero: Hero | number): Observable<Hero>{
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(this.heroesUrl, this.httpOptions).pipe(
      tap(_ => this.log(`Supprimé le héros avec id = ${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    )
  }

  searchHeroes(term: string): Observable<Hero[]>{
    if (!term.trim()){
      // pas de terme de recherche
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(x => x.length ? 
        this.log(`trouvé un héros correspondant à ${term}`):
        this.log(`Pas trouvé de héros correspondant à ${term}`),
        catchError(this.handleError<Hero[]>('searchHeroes',[]))
        )
    )
  }
}
