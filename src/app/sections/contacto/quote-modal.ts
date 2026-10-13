import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { ModalComponent } from '../../shared/components/modal/modal';
import { UiStateService } from '../../core/services/ui-state.service';
import { QuoteService } from '../../core/services/quote.service';
import { PRODUCTS } from '../../data/productos.data';

type Status = 'idle' | 'sending' | 'success' | 'error';
type FieldName =
  | 'name'
  | 'company'
  | 'country'
  | 'email'
  | 'phone'
  | 'product'
  | 'volume'
  | 'incoterm'
  | 'destPort'
  | 'shipDate'
  | 'message';

export const INCOTERMS = ['FOB', 'CFR', 'CIF'] as const;

const MESSAGE_MIN = 10;

/** Modal "Solicitar cotización" con formulario reactivo y validaciones. */
@Component({
  selector: 'app-quote-modal',
  imports: [ModalComponent, ReactiveFormsModule, TranslocoDirective, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quote-modal.html',
})
export class QuoteModalComponent {
  protected readonly ui = inject(UiStateService);
  private readonly quotes = inject(QuoteService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly products = PRODUCTS;
  protected readonly messageMin = MESSAGE_MIN;
  protected readonly incoterms = INCOTERMS;
  protected readonly today = new Date().toISOString().slice(0, 10);
  protected readonly status = signal<Status>('idle');
  protected readonly submitted = signal(false);
  protected readonly sentTo = signal('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    company: ['', [Validators.required, Validators.maxLength(120)]],
    country: ['', [Validators.required, Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[+d][ds().-]{5,}$/)]],
    product: ['', Validators.required],
    volume: ['', [Validators.required, Validators.maxLength(80)]],
    incoterm: ['', Validators.required],
    destPort: ['', [Validators.required, Validators.maxLength(80)]],
    shipDate: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(MESSAGE_MIN)]],
  });

  protected readonly fields: { name: FieldName; type: string; autocomplete: string }[] = [
    { name: 'name', type: 'text', autocomplete: 'name' },
    { name: 'company', type: 'text', autocomplete: 'organization' },
    { name: 'country', type: 'text', autocomplete: 'country-name' },
    { name: 'email', type: 'email', autocomplete: 'email' },
    { name: 'phone', type: 'tel', autocomplete: 'tel' },
  ];

  protected readonly shipFields: { name: FieldName; type: string; autocomplete: string }[] = [
    { name: 'volume', type: 'text', autocomplete: 'off' },
    { name: 'destPort', type: 'text', autocomplete: 'off' },
    { name: 'shipDate', type: 'date', autocomplete: 'off' },
  ];

  /** Contador de errores para el resumen (se recalcula en cada intento de envío). */
  protected readonly errorCount = signal(0);
  protected readonly showSummary = computed(() => this.submitted() && this.errorCount() > 0);

  constructor() {
    // Preselecciona el producto cuando la cotización se abre desde una card
    effect(() => {
      if (this.ui.quoteOpen()) {
        const product = this.ui.quoteProduct();
        untracked(() => {
          if (product) this.form.controls.product.setValue(product);
          if (this.status() === 'success') this.reset();
        });
      }
    });
  }

  protected showError(field: FieldName): boolean {
    const c = this.form.controls[field];
    return c.invalid && (c.touched || this.submitted());
  }

  protected firstError(field: FieldName): 'required' | 'email' | 'minlength' | 'pattern' | null {
    const e = this.form.controls[field].errors;
    if (!e) return null;
    if (e['required']) return 'required';
    if (e['email']) return 'email';
    if (e['minlength']) return 'minlength';
    if (e['pattern']) return 'pattern';
    return 'required';
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorCount.set(Object.values(this.form.controls).filter((c) => c.invalid).length);
      // Lleva el foco al primer campo con error
      setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    this.errorCount.set(0);
    this.status.set('sending');
    try {
      await this.quotes.send(this.form.getRawValue());
      this.sentTo.set(this.form.controls.email.value);
      this.status.set('success');
    } catch {
      // Conservamos lo escrito para que pueda reintentar
      this.status.set('error');
    }
  }

  protected reset(): void {
    this.form.reset();
    this.submitted.set(false);
    this.errorCount.set(0);
    this.status.set('idle');
  }

  protected close(): void {
    this.ui.closeQuote();
  }
}
