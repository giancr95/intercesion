import { create } from 'zustand';

export interface PrayerIntention {
    id: number;
    text: string;
    status: string;
}

interface PrayerStore {
    prayers: PrayerIntention[];
    addPrayer: (text: string) => void;
}

export const usePrayerStore = create<PrayerStore>((set) => ({
    prayers: [
        { id: 1, text: 'Sanación para mi mamá', status: 'En Cultivo' },
        { id: 2, text: 'Trabajo para mi hermano', status: 'En Espera' },
        { id: 3, text: 'Paz en mi familia', status: 'Respondida' },
        { id: 4, text: 'Sabiduría para mis estudios', status: 'En Cultivo' },
        { id: 5, text: 'Protección para mis hijos', status: 'En Espera' },
    ],
    addPrayer: (text: string) =>
        set((state) => ({
            prayers: [
                {
                    id: Date.now(),
                    text,
                    status: 'En Cultivo',
                },
                ...state.prayers,
            ],
        })),
}));
