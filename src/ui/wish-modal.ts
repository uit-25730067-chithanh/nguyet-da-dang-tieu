import { LanternItem } from '../state/lantern-store';

export class WishUI {
  private modal: HTMLElement | null;
  private btnClose: HTMLElement | null;
  private form: HTMLFormElement | null;
  private authorInput: HTMLInputElement | null;
  private messageInput: HTMLTextAreaElement | null;
  private charCountDisplay: HTMLElement | null;
  private popover: HTMLElement | null;
  private popoverAuthor: HTMLElement | null;
  private popoverMessage: HTMLElement | null;

  private currentType: 'lotus' | 'star' = 'lotus';
  private targetCoords?: { x: number; z: number };
  private onWishSubmitCallback?: (author: string, message: string, type: 'lotus' | 'star', coords?: { x: number; z: number }) => void;
  private popoverTimer?: number;

  constructor() {
    this.modal = document.getElementById('wish-modal');
    this.btnClose = document.getElementById('btn-close-modal');
    this.form = document.getElementById('wish-form') as HTMLFormElement;
    this.authorInput = document.getElementById('wish-author') as HTMLInputElement;
    this.messageInput = document.getElementById('wish-message') as HTMLTextAreaElement;
    this.charCountDisplay = document.getElementById('char-remaining');

    this.popover = document.getElementById('wish-popover');
    this.popoverAuthor = document.getElementById('popover-author');
    this.popoverMessage = document.getElementById('popover-message');

    this.initEvents();
  }

  private initEvents(): void {
    // Close modal
    this.btnClose?.addEventListener('click', () => this.closeModal());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Character counter
    this.messageInput?.addEventListener('input', () => {
      if (this.charCountDisplay && this.messageInput) {
        const remaining = 120 - this.messageInput.value.length;
        this.charCountDisplay.textContent = `${remaining}`;
      }
    });

    // Quick chips
    const chips = document.querySelectorAll('.wish-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        if (this.messageInput) {
          this.messageInput.value = chip.textContent?.trim() || '';
          if (this.charCountDisplay) {
            this.charCountDisplay.textContent = `${120 - this.messageInput.value.length}`;
          }
          this.messageInput.focus();
        }
      });
    });

    // Form submit
    this.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = this.authorInput?.value || '';
      const message = this.messageInput?.value || '';

      if (message.trim().length === 0) return;

      if (this.onWishSubmitCallback) {
        this.onWishSubmitCallback(author, message, this.currentType, this.targetCoords);
      }

      this.closeModal();
    });

    // Dismiss popover on click anywhere
    window.addEventListener('pointerdown', (e) => {
      if (this.popover && !this.popover.contains(e.target as Node)) {
        this.hidePopover();
      }
    });
  }

  public openModal(type: 'lotus' | 'star' = 'lotus', coords?: { x: number; z: number }): void {
    this.currentType = type;
    this.targetCoords = coords;

    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.querySelector('.modal-desc');

    if (modalTitle && modalDesc) {
      if (type === 'star') {
        modalTitle.textContent = 'Gửi Ước Mơ Lên Cung Trăng';
        modalDesc.textContent = 'Thắp sáng đèn ông sao đỏ rực, gửi gắm khát vọng bay vút lên bầu trời thu.';
      } else {
        modalTitle.textContent = 'Gửi Ước Nguyện Đêm Rằm';
        modalDesc.textContent = 'Thắp lên ngọn nến hoa đăng mang theo tâm nguyện trôi bồng bềnh trên dòng sông ánh sáng.';
      }
    }

    if (this.modal) {
      this.modal.classList.remove('hidden');
      setTimeout(() => {
        this.messageInput?.focus();
      }, 100);
    }
  }

  public closeModal(): void {
    if (this.modal) {
      this.modal.classList.add('hidden');
      if (this.messageInput) this.messageInput.value = '';
      if (this.charCountDisplay) this.charCountDisplay.textContent = '120';
      this.targetCoords = undefined;
    }
  }

  public onSubmit(callback: (author: string, message: string, type: 'lotus' | 'star', coords?: { x: number; z: number }) => void): void {
    this.onWishSubmitCallback = callback;
  }

  public showPopover(item: LanternItem, screenX: number, screenY: number): void {
    if (!this.popover || !this.popoverAuthor || !this.popoverMessage) return;

    window.clearTimeout(this.popoverTimer);

    this.popoverAuthor.textContent = `${item.author} ${item.type === 'star' ? '⭐' : '🪷'}`;
    this.popoverMessage.textContent = item.message;

    // Adjust position to avoid screen edges
    const popoverWidth = 260;
    const popoverHeight = 110;
    let left = screenX - popoverWidth / 2;
    let top = screenY - popoverHeight - 15;

    if (left < 16) left = 16;
    if (left + popoverWidth > window.innerWidth - 16) left = window.innerWidth - popoverWidth - 16;
    if (top < 70) top = screenY + 20; // Flip below if too high

    this.popover.style.left = `${left}px`;
    this.popover.style.top = `${top}px`;
    this.popover.classList.remove('hidden');

    this.popoverTimer = window.setTimeout(() => {
      this.hidePopover();
    }, 4500);
  }

  public hidePopover(): void {
    if (this.popover) {
      this.popover.classList.add('hidden');
    }
  }
}
