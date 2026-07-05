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

  getBotResponse(message: string): string {
    const text = message.toLowerCase();

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
        text.includes('séance') ||
        text.includes('seance') ||
        text.includes('prix') ||
        text.includes('coûte') ||
        text.includes('coute')
        )
    ) {
        return 'Le prix d’une séance avec coach dépend de l’activité choisie et de la durée. Dans cette version de démonstration, le tarif exact est défini par l’administration du centre.';
    }

    if (
        text.includes('durée minimale') ||
        text.includes('duree minimale') ||
        text.includes('minimum') ||
        text.includes('2 heures') ||
        text.includes('deux heures')
    ) {
        return 'La durée minimale d’une réservation de terrain est de 2 heures. Une réservation plus courte sera refusée automatiquement.';
    }

    if (
        text.includes('annuler réservation') ||
        text.includes('annuler reservation') ||
        text.includes('supprimer réservation') ||
        text.includes('supprimer reservation') ||
        text.includes('annuler mon terrain')
    ) {
        return 'Oui, vous pouvez annuler une réservation depuis Espace Client → Mes réservations. Après l’annulation, le créneau redevient disponible pour les autres clients.';
    }

    if (
        text.includes('réserver dans le passé') ||
        text.includes('reserver dans le passe') ||
        text.includes('date passée') ||
        text.includes('date passee') ||
        text.includes('passé') ||
        text.includes('passe')
    ) {
        return 'Non, il n’est pas possible de réserver un terrain, un coach ou une activité dans le passé. Le système bloque automatiquement les dates passées.';
    }

    if (
        text.includes('pourquoi') &&
        (
        text.includes('réserver') ||
        text.includes('reserver') ||
        text.includes('créneau') ||
        text.includes('creneau')
        )
    ) {
        return 'Si vous ne pouvez pas réserver un créneau, c’est peut-être parce que le terrain est déjà réservé, que la date est passée, que la durée est inférieure à 2 heures ou que le terrain est en maintenance.';
    }

    if (
        text.includes('terrain disponible') ||
        text.includes('disponibilité terrain') ||
        text.includes('disponibilite terrain') ||
        text.includes('terrain libre')
    ) {
        return 'Un terrain est disponible lorsqu’il n’a aucune réservation sur le même créneau et la même date. Le système vérifie automatiquement les conflits avant de confirmer la réservation.';
    }

    if (
        text.includes('coach refuse') ||
        text.includes('coach refusé') ||
        text.includes('coach refusee') ||
        text.includes('demande refusée') ||
        text.includes('demande refusee')
    ) {
        return 'Si le coach refuse votre demande, elle passe au statut refusée. Vous pouvez alors envoyer une autre demande à un autre coach ou choisir un autre créneau.';
    }

    if (
        text.includes('coach accepte') ||
        text.includes('demande acceptée') ||
        text.includes('demande acceptee') ||
        text.includes('acceptée') ||
        text.includes('acceptee')
    ) {
        return 'Quand un coach accepte votre demande, la séance devient confirmée. Vous pourrez la suivre depuis votre espace client dans la page Mes demandes.';
    }

    if (
        text.includes('plusieurs demandes') ||
        text.includes('même horaire') ||
        text.includes('meme horaire') ||
        text.includes('même créneau') ||
        text.includes('meme creneau')
    ) {
        return 'Non, vous ne pouvez pas envoyer plusieurs demandes de coach au même horaire. Cela évite les conflits dans votre planning.';
    }

    if (
        text.includes('coach congé') ||
        text.includes('coach conge') ||
        text.includes('coach absent') ||
        text.includes('congé coach') ||
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
        text.includes('créer cours collectif') ||
        text.includes('creer cours collectif')
    ) {
        return 'Les cours collectifs sont publiés par les coachs depuis leur espace coach. Les clients peuvent ensuite consulter les cours disponibles et participer.';
    }

    if (
        text.includes('participer deux fois') ||
        text.includes('deux fois') ||
        text.includes('déjà participant') ||
        text.includes('deja participant')
    ) {
        return 'Non, vous ne pouvez pas participer deux fois au même cours collectif ou au même événement. Le système bloque automatiquement les doublons.';
    }

    if (
        text.includes('événement désactivé') ||
        text.includes('evenement desactive') ||
        text.includes('événement desactive') ||
        text.includes('evenement désactivé') ||
        text.includes('désactivé') ||
        text.includes('desactive')
    ) {
        return 'Quand un événement est désactivé, il apparaît grisé. Les nouveaux utilisateurs ne peuvent plus participer, mais les participants déjà inscrits peuvent encore quitter l’événement.';
    }

    if (
        text.includes('événement supprimé') ||
        text.includes('evenement supprime') ||
        text.includes('événement supprime') ||
        text.includes('evenement supprimé') ||
        text.includes('supprimé') ||
        text.includes('supprime')
    ) {
        return 'Quand un événement est supprimé par l’administration, il disparaît définitivement. Les participants reçoivent une notification pour les informer de la suppression.';
    }

    if (
        text.includes('événement réactivé') ||
        text.includes('evenement reactive') ||
        text.includes('réactivé') ||
        text.includes('reactive')
    ) {
        return 'Quand un événement est réactivé, il redevient visible et disponible. Les anciens participants restent inscrits si leurs participations existaient déjà.';
    }

    if (
        text.includes('quitter événement') ||
        text.includes('quitter evenement') ||
        text.includes('annuler participation') ||
        text.includes('ne plus participer')
    ) {
        return 'Oui, si vous participez déjà à un événement, le bouton devient Quitter. Vous pouvez donc annuler votre participation.';
    }

    if (
        text.includes('qui publie les événements') ||
        text.includes('qui publie les evenements') ||
        text.includes('créer événement') ||
        text.includes('creer evenement') ||
        text.includes('administration événement')
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
        text.includes('terrain fermé') ||
        text.includes('terrain ferme')
    ) {
        return 'Quand un terrain est en maintenance, il devient indisponible pendant la période définie par l’administration. Les réservations concernées peuvent être annulées et les clients sont notifiés.';
    }

    if (
        text.includes('réserver') ||
        text.includes('reserver') ||
        text.includes('réservation') ||
        text.includes('reservation') ||
        text.includes('terrain') ||
        text.includes('tennis')
    ) {
        return 'Pour réserver un terrain, allez dans Espace Client → Tennis. Choisissez un terrain, une date et un créneau disponible, puis confirmez la réservation.';
    }

    if (
        text.includes('demander un coach') ||
        text.includes('demande coach') ||
        text.includes('coaching')
    ) {
        return 'Pour demander un coach, allez dans Espace Client → Demande de coach. Choisissez l’activité, le coach, la date et l’heure souhaitée, puis envoyez la demande.';
    }

    if (
        text.includes('mes réservations') ||
        text.includes('mes reservations') ||
        text.includes('voir réservations') ||
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
        text.includes('déconnexion') ||
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

    return 'Je n’ai pas bien compris votre question. Vous pouvez me demander par exemple : combien coûte une séance coach, quelle est la durée minimale d’une réservation, puis-je annuler une réservation, que se passe-t-il si un événement est supprimé, ou puis-je quitter un cours collectif.';
    }
  
}