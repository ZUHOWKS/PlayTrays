import Popup from "@/components/utils/Popup.vue";

interface Popup {
    title: string;
    textContent: string;
    isVisible: boolean;
}

export class PopupObject implements Popup {
    title: string;
    textContent: string;
    isVisible: boolean;

    constructor(title: string, textContent: string) {
        this.title = title;
        this.textContent = textContent;
        this.isVisible = false;
    }

    public show(): void {
        this.isVisible = true;
    }

    public hidden(): void {
        this.isVisible = false;
    }

    public setContent(title: string, textContent: string) {
        this.title = title;
        this.textContent = textContent;
    }
}