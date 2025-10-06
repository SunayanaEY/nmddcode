import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({

  selector: 'app-root',
  //standalone: false,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'nmddcode';

  constructor(private translate: TranslateService) {
this.translate.setFallbackLang('en') ;// Default language
this.translate.use('en'); // Initial language
}

switchLanguage(lang: string) {
this.translate.use(lang); // Switch language dynamically
}
}
