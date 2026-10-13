import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  BRAND_DESCRIPTOR,
  BRAND_NAME,
  CONTACT,
  LEGAL_NAME,
  LOGO,
  RUC,
} from '../../core/config/brand';
import { LangSwitchComponent } from '../header/lang-switch';

@Component({
  selector: 'app-footer',
  imports: [TranslocoDirective, LangSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-palta-deep text-niebla" *transloco="let t; prefix: 'footer'">
      <div class="container-page grid gap-12 py-16 md:grid-cols-12">
        <div class="md:col-span-5">
          <div class="flex items-center gap-3">
            <img
              [src]="logo.dark"
              alt=""
              [width]="logo.width"
              [height]="logo.height"
              class="h-12 w-auto"
              loading="lazy"
            />
            <div class="flex flex-col gap-[3px] leading-none">
              <p class="font-brand text-[1.75rem] leading-none font-semibold">{{ brand }}</p>
              <p class="text-sm font-medium text-[#C9D9B8]">{{ descriptor }}</p>
            </div>
          </div>
          <p class="mt-3 max-w-[36ch] text-niebla/75">{{ t('tagline') }}</p>
        </div>

        <div class="md:col-span-3">
          <h2 class="font-sans text-base font-semibold">{{ t('contact') }}</h2>
          <address class="mt-3 flex flex-col gap-1.5 not-italic text-niebla/75">
            <a [href]="'mailto:' + contact.email" class="hover:text-niebla hover:underline"
              ><bdi dir="ltr">{{ contact.email }}</bdi></a
            >
            <a [href]="'tel:' + tel" class="hover:text-niebla hover:underline"
              ><bdi dir="ltr">{{ contact.phone }}</bdi></a
            >
            <span>{{ contact.address }}</span>
          </address>
        </div>

        <div class="flex flex-col gap-6 md:col-span-4">
          <div>
            <h2 class="font-sans text-base font-semibold">{{ t('follow') }}</h2>
            <ul class="mt-3 flex gap-2">
              @for (s of contact.socials; track s.id) {
                <li>
                  <a
                    [href]="s.href"
                    class="grid size-11 place-items-center rounded-full border border-niebla/25 transition-colors hover:bg-niebla hover:text-palta"
                    [attr.aria-label]="s.label"
                  >
                    @switch (s.id) {
                      @case ('linkedin') {
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9z"
                          />
                        </svg>
                      }
                      @case ('instagram') {
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          aria-hidden="true"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="5" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                      }
                    }
                  </a>
                </li>
              }
            </ul>
          </div>
          <div>
            <h2 class="font-sans text-base font-semibold">{{ t('language') }}</h2>
            <app-lang-switch class="mt-3" [dropUp]="true" />
          </div>
        </div>
      </div>

      <div class="border-t border-niebla/10">
        <div
          class="container-page flex flex-col gap-3 py-6 text-sm text-niebla/60 sm:flex-row sm:justify-between"
        >
          <p>
            © {{ year }} <bdi>{{ legalName }}</bdi> ·
            <bdi dir="ltr" class="whitespace-nowrap">RUC {{ ruc }}</bdi>
            · {{ t('rights') }}
          </p>
          <a [href]="contact.privacyHref" class="hover:text-niebla hover:underline">{{
            t('privacy')
          }}</a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly brand = BRAND_NAME;
  protected readonly descriptor = BRAND_DESCRIPTOR;
  protected readonly legalName = LEGAL_NAME;
  protected readonly logo = LOGO;
  protected readonly contact = CONTACT;
  protected readonly ruc = RUC;
  protected readonly tel = CONTACT.phone.replace(/\s/g, '');
  protected readonly year = new Date().getFullYear();
}
