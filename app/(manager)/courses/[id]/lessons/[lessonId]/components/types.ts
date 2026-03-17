export interface VocabItem {
    id: string;
    hiragana: string;
    kanji: string;
    meaning: string;
    example: string;
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
}
