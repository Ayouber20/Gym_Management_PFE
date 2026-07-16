import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css']
})
export class Chatbot {

  isOpen = signal(false);
  userMessage = signal('');

  messages = signal<any[]>([
    {
      sender: 'bot',
      text: 'Bonjour 👋 Je suis votre assistant. Comment puis-je vous aider ?'
    }
  ]);

  quickQuestions = [
    'Combien coûte une séance coach ?',
    'Quelle est la durée minimale d’une réservation ?',
    'Puis-je annuler une réservation ?',
    'Pourquoi je ne peux pas réserver ce créneau ?',
    'Que se passe-t-il si le coach refuse ?',
    'Puis-je quitter un cours collectif ?',
    'Que faire si un événement est désactivé ?',
    'Que se passe-t-il si un événement est supprimé ?'
  ];

  quickQuestionResponses: Record<string, string> = {
    'combien coute une seance coach': 'Le prix d’une séance avec coach dépend de l’activité choisie et de la durée. Dans cette version de démonstration, le tarif exact est défini par l’administration du centre.',

    'quelle est la duree minimale d une reservation': 'La durée minimale d’une réservation de terrain est de 2 heures. Une réservation plus courte sera refusée automatiquement.',

    'puis je annuler une reservation': 'Oui, vous pouvez annuler une réservation depuis Espace Client → Mes réservations. Après l’annulation, le créneau redevient disponible pour les autres clients.',

    'pourquoi je ne peux pas reserver ce creneau': 'Si vous ne pouvez pas réserver un créneau, c’est peut-être parce que le terrain est déjà réservé, que la date est passée, que la durée est inférieure à 2 heures ou que le terrain est en maintenance.',

    'que se passe t il si le coach refuse': 'Si le coach refuse votre demande, elle passe au statut refusée. Vous pouvez alors envoyer une autre demande à un autre coach ou choisir un autre créneau.',

    'puis je quitter un cours collectif': 'Oui, si vous participez déjà à un cours collectif, le bouton devient Quitter. Vous pouvez donc annuler votre participation.',

    'que faire si un evenement est desactive': 'Quand un événement est désactivé, il apparaît grisé. Les nouveaux utilisateurs ne peuvent plus participer, mais les participants déjà inscrits peuvent encore quitter l’événement.',

    'que se passe t il si un evenement est supprime': 'Quand un événement est supprimé par l’administration, il disparaît définitivement. Les participants reçoivent une notification pour les informer de la suppression.'
  };

  toggleChat(): void {
    this.isOpen.update(value => !value);
  }

  sendMessage(): void {
    const message = this.userMessage().trim();

    if (!message) {
      return;
    }

    this.messages.update(messages => [
      ...messages,
      {
        sender: 'user',
        text: message
      }
    ]);

    const response = this.getBotResponse(message);

    setTimeout(() => {
      this.messages.update(messages => [
        ...messages,
        {
          sender: 'bot',
          text: response
        }
      ]);
    }, 300);

    this.userMessage.set('');
  }

  sendQuickQuestion(question: string): void {
    this.userMessage.set(question);
    this.sendMessage();
  }

  normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’']/g, ' ')
      .replace(/-/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  getBotResponse(message: string): string {
    const text = this.normalizeText(message);

    const exactQuickResponse = this.quickQuestionResponses[text];

    if (exactQuickResponse) {
      return exactQuickResponse;
    }

    if (
      text.includes('bonjour') ||
      text.includes('salut') ||
      text.includes('hello') ||
      text.includes('hi')
    ) {
      return 'Bonjour 😊 Je suis l’assistant du centre sportif. Je peux répondre aux questions sur les réservations, coachs, cours collectifs, événements, notifications et règles du centre.';
    }

    if (
      text.includes('combien') &&
      (
        text.includes('coach') ||
        text.includes('seance') ||
        text.includes('prix') ||
        text.includes('coute')
      )
    ) {
      return 'Le prix d’une séance avec coach dépend de l’activité choisie et de la durée. Dans cette version de démonstration, le tarif exact est défini par l’administration du centre.';
    }

    if (
      text.includes('duree minimale') ||
      text.includes('minimum') ||
      text.includes('2 heures') ||
      text.includes('deux heures')
    ) {
      return 'La durée minimale d’une réservation de terrain est de 2 heures. Une réservation plus courte sera refusée automatiquement.';
    }

    if (
      text.includes('annuler reservation') ||
      text.includes('annuler une reservation') ||
      text.includes('supprimer reservation') ||
      text.includes('annuler mon terrain')
    ) {
      return 'Oui, vous pouvez annuler une réservation depuis Espace Client → Mes réservations. Après l’annulation, le créneau redevient disponible pour les autres clients.';
    }

    if (
      text.includes('reserver dans le passe') ||
      text.includes('date passee') ||
      text.includes('passe')
    ) {
      return 'Non, il n’est pas possible de réserver un terrain, un coach ou une activité dans le passé. Le système bloque automatiquement les dates passées.';
    }

    if (
      text.includes('pourquoi') &&
      (
        text.includes('reserver') ||
        text.includes('reservation') ||
        text.includes('creneau')
      )
    ) {
      return 'Si vous ne pouvez pas réserver un créneau, c’est peut-être parce que le terrain est déjà réservé, que la date est passée, que la durée est inférieure à 2 heures ou que le terrain est en maintenance.';
    }

    if (
      text.includes('terrain disponible') ||
      text.includes('disponibilite terrain') ||
      text.includes('terrain libre')
    ) {
      return 'Un terrain est disponible lorsqu’il n’a aucune réservation sur le même créneau et la même date. Le système vérifie automatiquement les conflits avant de confirmer la réservation.';
    }

    if (
      text.includes('coach refuse') ||
      text.includes('demande refusee') ||
      text.includes('refuse')
    ) {
      return 'Si le coach refuse votre demande, elle passe au statut refusée. Vous pouvez alors envoyer une autre demande à un autre coach ou choisir un autre créneau.';
    }

    if (
      text.includes('coach accepte') ||
      text.includes('demande acceptee') ||
      text.includes('acceptee') ||
      text.includes('accepte')
    ) {
      return 'Quand un coach accepte votre demande, la séance devient confirmée. Vous pourrez la suivre depuis votre espace client dans la page Mes demandes.';
    }

    if (
      text.includes('plusieurs demandes') ||
      text.includes('meme horaire') ||
      text.includes('meme creneau')
    ) {
      return 'Non, vous ne pouvez pas envoyer plusieurs demandes de coach au même horaire. Cela évite les conflits dans votre planning.';
    }

    if (
      text.includes('coach conge') ||
      text.includes('coach absent') ||
      text.includes('conge coach')
    ) {
      return 'Si un coach est en congé, ses séances concernées peuvent être annulées. Les clients concernés reçoivent une notification pour les informer.';
    }

    if (
      text.includes('quitter cours') ||
      text.includes('quitter un cours') ||
      text.includes('cours collectif') ||
      text.includes('cours collectifs')
    ) {
      return 'Oui, si vous participez déjà à un cours collectif, le bouton devient Quitter. Vous pouvez donc annuler votre participation.';
    }

    if (
      text.includes('cours complet') ||
      text.includes('collectif complet') ||
      text.includes('plus de place')
    ) {
      return 'Si un cours collectif est complet, il n’est plus possible de participer. Le bouton affiche alors Complet ou devient indisponible.';
    }

    if (
      text.includes('qui publie les cours') ||
      text.includes('publie cours') ||
      text.includes('creer cours collectif')
    ) {
      return 'Les cours collectifs sont publiés par les coachs depuis leur espace coach. Les clients peuvent ensuite consulter les cours disponibles et participer.';
    }

    if (
      text.includes('participer deux fois') ||
      text.includes('deux fois') ||
      text.includes('deja participant')
    ) {
      return 'Non, vous ne pouvez pas participer deux fois au même cours collectif ou au même événement. Le système bloque automatiquement les doublons.';
    }

    if (
      text.includes('evenement desactive') ||
      text.includes('desactive')
    ) {
      return 'Quand un événement est désactivé, il apparaît grisé. Les nouveaux utilisateurs ne peuvent plus participer, mais les participants déjà inscrits peuvent encore quitter l’événement.';
    }

    if (
      text.includes('evenement supprime') ||
      text.includes('supprime')
    ) {
      return 'Quand un événement est supprimé par l’administration, il disparaît définitivement. Les participants reçoivent une notification pour les informer de la suppression.';
    }

    if (
      text.includes('evenement reactive') ||
      text.includes('reactive')
    ) {
      return 'Quand un événement est réactivé, il redevient visible et disponible. Les anciens participants restent inscrits si leurs participations existaient déjà.';
    }

    if (
      text.includes('quitter evenement') ||
      text.includes('annuler participation') ||
      text.includes('ne plus participer')
    ) {
      return 'Oui, si vous participez déjà à un événement, le bouton devient Quitter. Vous pouvez donc annuler votre participation.';
    }

    if (
      text.includes('qui publie les evenements') ||
      text.includes('creer evenement') ||
      text.includes('administration evenement')
    ) {
      return 'Les événements sont publiés par l’administration. Ils peuvent être destinés aux clients, aux coachs ou aux deux.';
    }

    if (
      text.includes('notification') ||
      text.includes('notifications') ||
      text.includes('alerte') ||
      text.includes('point rouge')
    ) {
      return 'Les notifications servent à informer l’utilisateur des changements importants : réservation, demande coach, séance annulée, nouvel événement ou mise à jour d’un événement.';
    }

    if (
      text.includes('maintenance') ||
      text.includes('terrain indisponible') ||
      text.includes('terrain ferme')
    ) {
      return 'Quand un terrain est en maintenance, il devient indisponible pendant la période définie par l’administration. Les réservations concernées peuvent être annulées et les clients sont notifiés.';
    }

    if (
      text.includes('demander un coach') ||
      text.includes('demande coach') ||
      text.includes('coaching')
    ) {
      return 'Pour demander un coach, allez dans Espace Client → Demande de coach. Choisissez l’activité, le coach, la date et l’heure souhaitée, puis envoyez la demande.';
    }

    if (
      text.includes('mes reservations') ||
      text.includes('voir reservations')
    ) {
      return 'Vous pouvez consulter vos réservations depuis Espace Client → Mes réservations. Vous y trouverez vos réservations confirmées, annulées ou terminées.';
    }

    if (
      text.includes('mes demandes') ||
      text.includes('suivre demande') ||
      text.includes('suivre mes demandes')
    ) {
      return 'Vous pouvez suivre vos demandes de coach depuis Espace Client → Mes demandes. Chaque demande possède un statut : en attente, acceptée, refusée, annulée, expirée ou terminée.';
    }

    if (
      text.includes('annonce') ||
      text.includes('annonces')
    ) {
      return 'Les annonces sont publiées par l’administration pour communiquer des informations générales aux clients et aux coachs, comme les nouveautés, fermetures ou maintenances.';
    }

    if (
      text.includes('admin') ||
      text.includes('administrateur') ||
      text.includes('gestion')
    ) {
      return 'L’administrateur peut gérer les utilisateurs, clients, coachs, terrains, réservations, demandes de coach, congés, annonces, événements et statistiques.';
    }

    if (
      text.includes('statistique') ||
      text.includes('statistiques') ||
      text.includes('stats')
    ) {
      return 'Les statistiques sont disponibles dans l’espace admin. Elles donnent une vue globale sur l’activité du centre : utilisateurs, réservations, coachs, demandes et événements.';
    }

    if (
      text.includes('deconnexion') ||
      text.includes('logout')
    ) {
      return 'Pour vous déconnecter, utilisez le menu de profil en haut de votre espace, puis cliquez sur Déconnexion.';
    }

    if (
      text.includes('merci') ||
      text.includes('thanks') ||
      text.includes('thank you')
    ) {
      return 'Avec plaisir 😊';
    }

    if (
      text.includes('horaires') ||
      text.includes('horaire') ||
      text.includes('ouverture') ||
      text.includes('fermeture')
    ) {
      return 'Dans cette version de démonstration, le centre sportif fonctionne avec des créneaux de réservation entre 08:00 et 22:00. Les horaires exacts peuvent être adaptés par l’administration.';
    }

    if (
      text.includes('mot de passe') ||
      text.includes('password') ||
      text.includes('compte') ||
      text.includes('profil')
    ) {
      return 'Vous pouvez accéder aux options de profil depuis le bouton rond en haut à droite. Selon votre espace, vous pouvez consulter votre profil, vos notifications et vous déconnecter.';
    }

    if (
      text.includes('statut') ||
      text.includes('status') ||
      text.includes('pending') ||
      text.includes('accepted') ||
      text.includes('rejected') ||
      text.includes('cancelled') ||
      text.includes('completed') ||
      text.includes('expired')
    ) {
      return 'Les statuts principaux sont : PENDING pour en attente, ACCEPTED ou CONFIRMED pour accepté/confirmé, REJECTED pour refusé, CANCELLED pour annulé, COMPLETED pour terminé, et EXPIRED pour expiré.';
    }

    if (
      text.includes('reserver') ||
      text.includes('reservation') ||
      text.includes('terrain') ||
      text.includes('tennis')
    ) {
      return 'Pour réserver un terrain, allez dans Espace Client → Tennis. Choisissez un terrain, une date et un créneau disponible, puis confirmez la réservation.';
    }

    return 'Je n’ai pas bien compris votre question. Vous pouvez me demander par exemple : combien coûte une séance coach, quelle est la durée minimale d’une réservation, puis-je annuler une réservation, que se passe-t-il si un événement est supprimé, ou puis-je quitter un cours collectif.';
  }

}