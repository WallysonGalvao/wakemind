export const supportPT = {
  'support.faq.title': 'Perguntas Frequentes',

  // Alarms & Notifications
  'support.faq.alarms.title': 'Alarmes e Notificações',
  'support.faq.alarms.notRinging.question': 'O alarme não está tocando no horário',
  'support.faq.alarms.notRinging.answer':
    'Verifique se as notificações estão habilitadas para o WakeMind nas configurações do sistema. Confirme que o alarme está ativo (toggle ligado). Certifique-se de que o volume do dispositivo não está no mínimo.',
  'support.faq.alarms.locked.question': 'O alarme não toca quando o celular está bloqueado',
  'support.faq.alarms.locked.answer':
    'iOS: Vá em Ajustes > Notificações > WakeMind e habilite "Mostrar na Tela de Bloqueio". Android: Verifique se as permissões de alarme exato estão concedidas.',
  'support.faq.alarms.snooze.question': 'Como funciona a Proteção de Soneca?',
  'support.faq.alarms.snooze.answer':
    'Quando ativada, você precisa completar um desafio cognitivo para adiar o alarme, evitando o snooze inconsciente.',
  'support.faq.alarms.permissions.question': 'Quais permissões o WakeMind precisa no Android 14+?',
  'support.faq.alarms.permissions.answer':
    'Android 14+ requer: 1) Notificações em Tela Cheia - para abrir o app automaticamente quando o alarme disparar (Configurações > Apps > WakeMind > Notificações > Permitir notificações em tela cheia). 2) Desativar Otimização de Bateria - garante que os alarmes toquem mesmo quando o celular está em repouso.',
  'support.faq.alarms.autoOpen.question': 'O app não abre automaticamente quando o alarme toca',
  'support.faq.alarms.autoOpen.answer':
    'Ative "Notificações em Tela Cheia" em Configurações > Apps > WakeMind > Notificações. Também desative a otimização de bateria para o WakeMind.',

  // Sound & Vibration
  'support.faq.sound.title': 'Som e Vibração',
  'support.faq.sound.noVibration.question': 'O alarme não vibra',
  'support.faq.sound.noVibration.answer':
    'Verifique se a vibração está habilitada nas configurações do sistema. Desative o modo silencioso (alguns dispositivos bloqueiam vibração neste modo). Teste o padrão de vibração em Configurações > Som e Vibração.',
  'support.faq.sound.testTones.question': 'Como testar os tons de alarme?',
  'support.faq.sound.testTones.answer':
    'Vá em Configurações > Tom de Alarme e toque em qualquer som para ouvi-lo antes de selecionar.',

  // Cognitive Challenges
  'support.faq.challenges.title': 'Desafios Cognitivos',
  'support.faq.challenges.difficult.question': 'Os desafios são muito difíceis',
  'support.faq.challenges.difficult.answer':
    'Os desafios são projetados para garantir que você esteja totalmente desperto. Com o tempo, seu cérebro se adaptará.',
  'support.faq.challenges.screenLock.question': 'A tela fica bloqueando durante o desafio',
  'support.faq.challenges.screenLock.answer':
    'Ative "Evitar Bloqueio Automático" em Configurações > Comportamento.',

  // Performance Summary
  'support.faq.performance.title': 'Resumo de Performance',
  'support.faq.performance.cognitiveScore.question': 'Como minha Pontuação Cognitiva é calculada?',
  'support.faq.performance.cognitiveScore.answer':
    'Sua pontuação (0-100) é baseada em: dificuldade do desafio (Fácil: 60pts, Médio: 75pts, Difícil: 90pts), número de tentativas (-10pts por tentativa extra), velocidade de conclusão (bônus até +15pts para <10s), e tempo total (-10pts se >2min).',
  'support.faq.performance.streak.question': 'O que é uma Sequência?',
  'support.faq.performance.streak.answer':
    'Sua sequência conta dias consecutivos em que você completou desafios de alarme com sucesso. Ela reseta se você perder um dia ou não completar um desafio.',
  'support.faq.performance.data.question': 'Onde meus dados de performance são armazenados?',
  'support.faq.performance.data.answer':
    'Todos os dados de performance (sequências, pontuações, tempos de reação) são armazenados localmente no seu dispositivo. Nenhum dado é enviado para servidores externos.',

  // Technical Issues
  'support.faq.technical.title': 'Problemas Técnicos',
  'support.faq.technical.crashing.question': 'O app está travando',
  'support.faq.technical.crashing.answer':
    '1. Force o fechamento do aplicativo. 2. Reinicie seu dispositivo. 3. Certifique-se de ter a última versão instalada. 4. Se persistir, desinstale e reinstale o aplicativo (seus alarmes serão perdidos).',
  'support.faq.technical.battery.question': 'O app está consumindo muita bateria',
  'support.faq.technical.battery.answer':
    'Desative "Evitar Bloqueio Automático" se não estiver usando. Reduza a intensidade do padrão de vibração. Verifique se não há alarmes duplicados.',

  // Contact
  'support.contact.title': 'Precisa de Mais Ajuda?',
  'support.contact.description':
    'Encontrou um bug ou tem uma sugestão? Entre em contato e retornaremos o mais breve possível.',
  'support.contact.emailButton': 'Enviar Email',

  // Footer
  'support.footer': 'WakeMind - Desperte sua mente, não apenas seu corpo.',
};
