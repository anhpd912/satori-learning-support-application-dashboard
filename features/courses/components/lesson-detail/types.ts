export interface VocabItem {
    id: string;
    japaneseText: string;
    reading: string;
    meaning: string;
    originalData?: any;
}

export interface GrammarExample {
    id: string;
    japanese: string;
    vietnamese: string;
}

export interface GrammarItem {
    id: string;
    order: number;
    structure: string;
    shortDesc?: string;
    explanation: string;
    examples: GrammarExample[];
    originalData?: any;
}
