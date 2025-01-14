import { App, SuggestModal } from "obsidian";

export interface SuggesterModalOptions<T> {
  displayedValues: string[];
  usedValues: T[];
  title: string;
  description?: string
}

interface SuggestionWithIndex<T> {
  index: number;
  item: T;
  displayValue: string;
}

export class SuggesterModal<T> extends SuggestModal<SuggestionWithIndex<T>> {
  protected displayedValues: string[];
  protected usedValues: T[];
  protected title: string;
  protected description: string | undefined; // Added description element
  protected resolvePromise?: (value: T | null) => void;

  constructor(app: App, { displayedValues, usedValues, title, description }: SuggesterModalOptions<T>) {
    super(app);

    if (displayedValues.length !== usedValues.length) {
      throw new Error("Displayed values and used values must have the same length");
    }

    this.displayedValues = displayedValues;
    this.usedValues = usedValues;
    this.title = title;
    this.description = description; // Initialize description

    this.initializeModal()
  }

  protected initializeModal(): void {
    if (this.description) { // Check for description
      const descriptionEl = this.modalEl.createEl('span', { text: this.description });
      descriptionEl.style.margin = '1rem';
      descriptionEl.style.marginTop = '0.4rem';
      this.modalEl.insertBefore(descriptionEl, this.modalEl.firstChild); // Insert description before title
    }
    if (this.title) {
      this.setTitle(this.title);
      this.titleEl.style.margin = '1rem'
      this.titleEl.style.marginBottom = '0'
      this.modalEl.insertBefore(this.titleEl, this.modalEl.firstChild);
    }
  }

  getSuggestions(query: string): SuggestionWithIndex<T>[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    return this.displayedValues
      .map((displayValue, index) => ({
        index,
        item: this.usedValues[index],
        displayValue
      }))
      .filter(({ displayValue }) => 
        displayValue.toLowerCase().includes(normalizedQuery)
      );
  }

  renderSuggestion(suggestion: SuggestionWithIndex<T>, el: HTMLElement): void {
    el.createEl('div', { text: suggestion.displayValue });
  }

  async onChooseSuggestion(suggestion: SuggestionWithIndex<T>): Promise<void> {
    if (this.resolvePromise) {
      this.resolvePromise(suggestion.item);
    }
  }

  async open(): Promise<T | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      super.open();
    });
  }
}

export const openSuggester = async <T>(app: App, options: SuggesterModalOptions<T>) => {
  const suggester = await new SuggesterModal(app, options).open();
  return suggester
}
