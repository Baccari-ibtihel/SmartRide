import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  id: number;
  bookingId: number;
  senderName: string;
  senderRole: 'PASSAGER' | 'CONDUCTEUR';
  text: string;
  time: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly CHAT_KEY = 'smartride_chat_messages';
  private messagesSubject = new BehaviorSubject<{ [bookingId: number]: ChatMessage[] }>(this.loadFromStorage());
  messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.seedInitialMessages();
  }

  getMessages(bookingId: number): ChatMessage[] {
    const all = this.messagesSubject.value;
    return all[bookingId] || [];
  }

  sendMessage(bookingId: number, text: string, senderName: string, senderRole: 'PASSAGER' | 'CONDUCTEUR'): ChatMessage {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: Date.now(),
      bookingId,
      senderName,
      senderRole,
      text: text.trim(),
      time: timeStr,
      timestamp: Date.now()
    };

    const all = this.loadFromStorage();
    if (!all[bookingId]) {
      all[bookingId] = [];
    }
    all[bookingId].push(newMsg);
    this.saveToStorage(all);

    // If passenger sent a message, driver automatically replies realistically after 1.2s!
    if (senderRole === 'PASSAGER') {
      setTimeout(() => {
        this.triggerDriverAutoReply(bookingId, text);
      }, 1200);
    }

    return newMsg;
  }

  private triggerDriverAutoReply(bookingId: number, passengerText: string): void {
    const q = passengerText.toLowerCase();
    let replyText = 'Message bien reçu ! Je conduis prudemment et j\'arrive bientôt.';

    if (q.includes('salem') || q.includes('3aslema') || q.includes('bonjour') || q.includes('sbah')) {
      replyText = 'Salem ! Marhba bik, je suis en route pour vous récupérer.';
    } else if (q.includes('retard') || q.includes('min') || q.includes('attendez') || q.includes('d9i9a')) {
      replyText = 'D\'accord aucun problème ! Prenez votre temps, je vous attends au point convenu.';
    } else if (q.includes('win') || q.includes('où') || q.includes('position') || q.includes('fink')) {
      replyText = 'Je suis à moins de 2 minutes dans la rue principale ! Voiture Clio 4 Blanche (214 TN 5421).';
    } else if (q.includes('point') || q.includes('station') || q.includes('arret') || q.includes('rendez')) {
      replyText = 'Parfait, je me gare juste en face à droite pour que vous puissiez monter facilement.';
    } else if (q.includes('merci') || q.includes('chokran') || q.includes('c bon') || q.includes('daccord') || q.includes('ok')) {
      replyText = 'Avec grand plaisir ! À tout de suite 👍';
    } else if (q.includes('klaxon') || q.includes('appeler') || q.includes('sonner')) {
      replyText = 'Dès que je m\'arrête, je klaxonne un petit coup pour vous prévenir.';
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const driverMsg: ChatMessage = {
      id: Date.now() + 1,
      bookingId,
      senderName: 'Sami Mansouri (Conducteur)',
      senderRole: 'CONDUCTEUR',
      text: replyText,
      time: timeStr,
      timestamp: Date.now()
    };

    const all = this.loadFromStorage();
    if (!all[bookingId]) all[bookingId] = [];
    all[bookingId].push(driverMsg);
    this.saveToStorage(all);
  }

  private loadFromStorage(): { [bookingId: number]: ChatMessage[] } {
    try {
      const raw = localStorage.getItem(this.CHAT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveToStorage(all: { [bookingId: number]: ChatMessage[] }): void {
    localStorage.setItem(this.CHAT_KEY, JSON.stringify(all));
    this.messagesSubject.next(all);
  }

  private seedInitialMessages(): void {
    const existing = this.loadFromStorage();
    if (Object.keys(existing).length > 0) return;

    // Seed realistic welcome conversation on demo booking 50
    const demoConversation: ChatMessage[] = [
      {
        id: 101,
        bookingId: 50,
        senderName: 'Sami Mansouri (Conducteur)',
        senderRole: 'CONDUCTEUR',
        text: 'Bonjour ! Merci pour votre réservation. Je partirai bien à 08h15 d\'Ariana Borj Louzir.',
        time: '08:02',
        timestamp: Date.now() - 600000
      },
      {
        id: 102,
        bookingId: 50,
        senderName: 'Ibtihel Baccari',
        senderRole: 'PASSAGER',
        text: 'Salem Sami ! Parfait, je vous attendrai juste devant la pharmacie.',
        time: '08:05',
        timestamp: Date.now() - 400000
      },
      {
        id: 103,
        bookingId: 50,
        senderName: 'Sami Mansouri (Conducteur)',
        senderRole: 'CONDUCTEUR',
        text: 'C\'est noté ! Ma voiture est une Clio 4 Blanche immatriculée 214 TN 5421.',
        time: '08:06',
        timestamp: Date.now() - 300000
      }
    ];

    existing[50] = demoConversation;
    this.saveToStorage(existing);
  }
}
