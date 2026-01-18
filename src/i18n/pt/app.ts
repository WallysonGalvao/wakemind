export const appPT = {
  // Alarms Screen
  'alarms.title': 'Seus Alarmes',
  'alarms.edit': 'Editar',
  'alarms.done': 'Concluído',
  'alarms.newAlarm': 'Novo Alarme',
  'alarms.emptyTitle': 'Nenhum Alarme Configurado',
  'alarms.emptyDescription':
    'Seu foco matinal começa aqui. Configure seu horário de despertar para ativar seu dia.',
  'alarms.setFirstAlarm': 'Configurar Primeiro Alarme',

  // Alarm Card
  'alarm.daily': 'Diariamente',
  'alarm.weekdays': 'Dias úteis',
  'alarm.weekends': 'Fins de semana',
  'alarm.once': 'Uma vez',
  'alarm.monday': 'Seg',
  'alarm.tuesday': 'Ter',
  'alarm.wednesday': 'Qua',
  'alarm.thursday': 'Qui',
  'alarm.friday': 'Sex',
  'alarm.saturday': 'Sáb',
  'alarm.sunday': 'Dom',

  // Challenges
  'challenge.math': 'Desafio de Matemática',
  'challenge.memory': 'Jogo da Memória',
  'challenge.squats': 'Desafio de Agachamentos',
  'challenge.barcode': 'Escanear Código',

  // New Alarm Screen
  'newAlarm.title': 'Novo Alarme',
  'newAlarm.reset': 'Resetar',
  'newAlarm.commit': 'Confirmar para {{time}}',
  'newAlarm.cognitiveActivation.title': 'Ativação Cognitiva',
  'newAlarm.cognitiveActivation.required': 'Obrigatório',
  'newAlarm.challenges.math.title': 'Desafio de Matemática',
  'newAlarm.challenges.math.description': 'Resolva 5 equações aritméticas para desligar o alarme.',
  'newAlarm.challenges.memory.title': 'Matriz de Memória',
  'newAlarm.challenges.memory.description': 'Memorize e recorde um padrão de blocos iluminados.',
  'newAlarm.challenges.logic.title': 'Quebra-cabeça Lógico',
  'newAlarm.challenges.logic.description': 'Complete a sequência para provar que está acordado.',
  'newAlarm.difficulty.label': 'Nível de Dificuldade',
  'newAlarm.difficulty.easy': 'Fácil',
  'newAlarm.difficulty.easyDescription': 'Desafios básicos. Perfeito para quem tem sono leve.',
  'newAlarm.difficulty.medium': 'Médio',
  'newAlarm.difficulty.mediumDescription': 'Desafios moderados. Rotina padrão de despertar.',
  'newAlarm.difficulty.hard': 'Difícil',
  'newAlarm.difficulty.hardDescription':
    'Desafios complexos. Para quem tem sono pesado e precisa de mais ajuda.',
  'newAlarm.difficulty.adaptive': 'Adaptativo',
  'newAlarm.difficulty.adaptiveDescription':
    'IA ajusta a dificuldade com base no seu histórico de despertar.',
  'newAlarm.schedule.label': 'Agenda',
  'newAlarm.schedule.daily': 'Diário',
  'newAlarm.schedule.weekdays': 'Úteis',
  'newAlarm.schedule.weekends': 'Fins',
  'newAlarm.schedule.once': 'Uma vez',
  'newAlarm.schedule.customLabel': 'Agenda Personalizada',
  'newAlarm.schedule.days.mon': 'Seg',
  'newAlarm.schedule.days.tue': 'Ter',
  'newAlarm.schedule.days.wed': 'Qua',
  'newAlarm.schedule.days.thu': 'Qui',
  'newAlarm.schedule.days.fri': 'Sex',
  'newAlarm.schedule.days.sat': 'Sáb',
  'newAlarm.schedule.days.sun': 'Dom',
  'newAlarm.backupProtocols.title': 'Protocolos de Backup',
  'newAlarm.backupProtocols.snooze.title': 'Soneca',
  'newAlarm.backupProtocols.snooze.description': 'Restrito (Desabilitado)',
  'newAlarm.backupProtocols.wakeCheck.title': 'Verificação de Despertar',
  'newAlarm.backupProtocols.wakeCheck.description': 'Confirmar 5m após alarme',
  'newAlarm.backupProtocols.barcodeScan.title': 'Escanear Código',
  'newAlarm.backupProtocols.barcodeScan.description': 'Escaneie pasta de dente para desligar',
  'newAlarm.backupProtocols.infoModal.title': 'O que são Protocolos de Backup?',
  'newAlarm.backupProtocols.infoModal.description':
    'Protocolos de Backup são mecanismos de segurança que garantem que você realmente vai acordar, mesmo que não consiga desativar o alarme principal com o desafio cognitivo.',
  'newAlarm.backupProtocols.infoModal.whyTitle': 'Por que são importantes?',
  'newAlarm.backupProtocols.infoModal.benefit1': 'Garantia zero-falha - você vai acordar',
  'newAlarm.backupProtocols.infoModal.benefit2': 'Previne voltar a dormir',
  'newAlarm.backupProtocols.infoModal.benefit3': 'Força engajamento físico e cognitivo',
  'newAlarm.backupProtocols.infoModal.protocolsTitle': 'Protocolos Disponíveis',
  'newAlarm.backupProtocols.infoModal.snoozeDescription':
    'A soneca é rigidamente controlada ou desabilitada por padrão. Soneca fácil seria contraproducente para um alarme focado em performance.',
  'newAlarm.backupProtocols.infoModal.wakeCheckDescription':
    'Após desativar o alarme, o app solicita uma confirmação 5 minutos depois para garantir que você não voltou a dormir.',
  'newAlarm.backupProtocols.infoModal.barcodeScanDescription':
    'Força você a escanear um código de barras (como pasta de dente) para desativar completamente o alarme, exigindo que você saia da cama.',
  'newAlarm.validationError.title': 'Alarme Inválido',
  'newAlarm.error.title': 'Erro',
  'newAlarm.error.message': 'Ocorreu um erro inesperado. Por favor, tente novamente.',

  // Errors
  'errors.failedToScheduleAlarm':
    'Falha ao agendar alarme. Verifique as permissões e tente novamente.',
  'errors.failedToRescheduleAlarm':
    'Falha ao atualizar alarme. Verifique as permissões e tente novamente.',

  // Validation Errors
  'validation.alarm.timeRequired': 'A hora é obrigatória e deve ser uma string',
  'validation.alarm.timeFormat': 'Formato de hora inválido. Formato esperado: HH:MM (ex., "05:30")',
  'validation.alarm.periodRequired': 'O período (AM/PM) é obrigatório',
  'validation.alarm.periodInvalid': 'Período inválido. Deve ser "AM" ou "PM"',
  'validation.alarm.duplicate': 'Já existe um alarme para {{time}} {{period}}',
  'validation.alarm.challengeRequired': 'O tipo de desafio é obrigatório',
  'validation.alarm.challengeIconRequired': 'O ícone do desafio é obrigatório',
  'validation.alarm.scheduleRequired': 'O horário é obrigatório',
  'validation.alarm.invalidSchedule': 'Formato de agenda inválido. Selecione dias válidos.',
  'validation.alarm.notFound': 'Alarme não encontrado',

  // Edit Alarm Screen
  'editAlarm.title': 'Editar Alarme',
  'editAlarm.save': 'Salvar Alterações',

  // Alarm Trigger Screen
  'alarmTrigger.dismiss': 'Desligar - Iniciar Desafio',
  'alarmTrigger.snooze': 'Soneca 5 min',
  'alarmTrigger.reliabilityMode': 'Modo Alta Confiabilidade Ativo',
  'alarmTrigger.offlineGuaranteed': 'Garantia Offline',
  'alarmTrigger.wakeUpProtocol': 'Protocolo de Despertar',
  'alarmTrigger.efficiencyTimer': 'Timer de Eficiência',
  'alarmTrigger.cognitiveChallenge': 'Desafio Cognitivo',
  'alarmTrigger.mathChallenge': 'Desafio de Matemática',
  'alarmTrigger.memoryChallenge': 'Desafio de Memória',
  'alarmTrigger.logicChallenge': 'Desafio de Lógica',
  'alarmTrigger.wrongAnswer': 'Resposta errada — tente novamente',
  'alarmTrigger.attempt': 'Tentativa {{current}} de {{max}}',
  'alarmTrigger.watchPattern': 'Observe o padrão',
  'alarmTrigger.repeatPattern': 'Repita o padrão',
  'alarmTrigger.getReady': 'Prepare-se...',
  'alarmTrigger.reviewPattern': 'Rever',
  'alarmTrigger.whichDoesntBelong': 'Qual não pertence ao grupo?',
  'alarmTrigger.showHint': 'Mostrar dica',
  'alarmTrigger.sequencePuzzle': 'Puzzle de sequência',
  'alarmTrigger.oddOneOut': 'Elemento diferente',

  // Logic Challenge Hints
  'alarmTrigger.hints.findPattern': 'Encontre o padrão',
  'alarmTrigger.hints.fruitsVsAnimal': 'Frutas vs Animal',
  'alarmTrigger.hints.vehiclesVsNature': 'Veículos vs Natureza',
  'alarmTrigger.hints.skyObjects': 'Objetos do céu',
  'alarmTrigger.hints.evenNumbers': 'Números pares',
  'alarmTrigger.hints.vowels': 'Vogais',
  'alarmTrigger.hints.colorsVsShape': 'Cores vs Forma',
  'alarmTrigger.hints.primeNumbers': 'Números primos',
  'alarmTrigger.hints.perfectSquares': 'Quadrados perfeitos',
  'alarmTrigger.hints.perfectCubes': 'Cubos perfeitos',

  // Logic Challenge Accessibility
  'alarmTrigger.accessibility.option': 'Opção {{option}}',
  'alarmTrigger.accessibility.selectOption': 'Selecione esta opção como sua resposta',
  'alarmTrigger.accessibility.showHintButton': 'Mostrar dica',
  'alarmTrigger.accessibility.showHintDescription': 'Toque para revelar uma dica do quebra-cabeça',
  'alarmTrigger.accessibility.submit': 'Enviar',
  'alarmTrigger.accessibility.submitAnswer': 'Enviar sua resposta',
  'alarmTrigger.accessibility.reviewPattern': 'Toque para ver o padrão novamente',

  // Validation
  'validation.atLeastOneDayRequired': 'Pelo menos um dia deve ser selecionado',

  // Notifications & Permissions
  'notifications.alarmTitle': 'Alarme WakeMind',
  'notifications.snoozedTitle': 'WakeMind - Soneca',
  'notifications.snoozedBody': 'Acorde! Soneca de {{time}} {{period}}',
  'permissions.notificationsRequired': 'Permissão de notificação é necessária para alarmes',
  'permissions.exactAlarmsRequired':
    'Permissão de alarme exato é necessária para despertar confiável',
  'permissions.batteryOptimization': 'Desative a otimização de bateria para alarmes confiáveis',
  'permissions.openSettings': 'Abrir Configurações',

  // Common
  'common.am': 'AM',
  'common.pm': 'PM',
  'common.save': 'Salvar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Excluir',
  'common.confirm': 'Confirmar',
  'common.ok': 'OK',
  'common.info': 'Mais informações',
  'common.close': 'Fechar',
  'common.back': 'Voltar',
  'common.share': 'Compartilhar',

  // Performance Summary
  'performance.summary': 'Resumo',
  'performance.wakeUpSuccess': 'Despertar Bem-Sucedido',
  'performance.missionAccomplished': 'Missão Cumprida',
  'performance.target': 'Meta',
  'performance.actual': 'Real',
  'performance.streak': 'Sequência',
  'performance.daysConsistent': 'Dias Consistentes',
  'performance.score': 'Pontuação',
  'performance.outOf100': 'De 100',
  'performance.weeklyExecution': 'Execução Semanal',
  'performance.reactionSpeed': 'Velocidade de Reação',
  'performance.startDay': 'Começar o Dia',
  'performance.quote': 'Disciplina é igual à liberdade.',
};
