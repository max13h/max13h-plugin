import { App, Modal, MomentFormatComponent, Setting } from "obsidian";

export class hourModal extends Modal {
  protected title: string;
  protected resolvePromise?: (value: string | null) => void;
  protected previousValueOfInput: string | undefined;
  protected valueOfInput: string | null;

  constructor(app: App, title: string) {
    super(app);

    this.title = title;
    this.setTitle(this.title);

    const updateValueOfHourInput = (sampleEl: MomentFormatComponent, value: string) => {
      if (this.previousValueOfInput && this.previousValueOfInput.endsWith(':') && value.length < this.previousValueOfInput.length || sampleEl.getValue().length > 5) {
        value = value.slice(0, -1);
      } else if (/^\d{2}$/.test(value)) {
        value += ':';
      }

      if (value !== sampleEl.getValue()) {
        sampleEl.setValue(value);
      }

      this.valueOfInput = sampleEl.getValue()
      this.previousValueOfInput = value
    };

    new Setting(this.contentEl)
      .addMomentFormat((sampleEl) => {
        sampleEl.setDefaultFormat('HH:mm')
        sampleEl.onChange(value => updateValueOfHourInput(sampleEl, value))
        
        // Timeout to prevent keyup to be triggered on initialization
        // Use of keydown because keydown fire a 'space' on document behind the modal
        setTimeout(() => {
          sampleEl.inputEl.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
              if (this.resolvePromise) {
                this.resolvePromise(this.valueOfInput);
              }
              this.close()
            }
          });
        }, 1000)
      })
      
    new Setting(this.contentEl)
    .addButton((btn) =>
      btn
        .setButtonText('Continuer')
        .setCta()
        .onClick(() => {
          if (this.resolvePromise) {
            this.resolvePromise(this.valueOfInput);
          }
          this.close()
        }));
  }

  async open(): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      super.open();
    });
  }
}

export const openHourModal = async (app: App, title: string) => {
  const suggester = await new hourModal(app, title).open();
  return suggester
}
