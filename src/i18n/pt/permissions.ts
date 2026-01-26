export default {
  title: 'Configure seu horário de alarme',
  progressLabel: '{{current}}/{{total}}',

  notifications: {
    ios: {
      title: 'Permitir que "{{appName}}" agende alarmes e cronômetros?',
      description:
        'Isso permitirá que o app agende alarmes e cronômetros que podem tocar sons e aparecer na tela mesmo se um Foco estiver ativo.',
      additionalInfo:
        'Precisamos desta permissão para tocar o alarme quando o telefone estiver bloqueado.',
    },
    android: {
      title: 'Permitir que {{appName}} envie notificações?',
      description:
        'Notificações são essenciais para o alarme tocar. Sem esta permissão, os alarmes não funcionarão.',
      additionalInfo: 'Você pode personalizar as configurações de notificação mais tarde no app.',
    },
    general: {
      title: '"{{appName}}" Gostaria de Enviar Notificações',
      description:
        'As notificações podem incluir alertas, sons e ícones de badge. Elas podem ser configuradas nas Configurações.',
    },
  },

  exactAlarms: {
    title: 'Permitir agendamento preciso de alarmes?',
    description:
      'Esta permissão garante que seu alarme toque exatamente no horário, mesmo quando seu telefone estiver em modo de economia de energia.',
    additionalInfo: 'Necessário para Android 12+ agendar alarmes exatos.',
  },

  batteryOptimization: {
    title: 'Desativar otimização de bateria?',
    description:
      'A otimização de bateria pode impedir que os alarmes toquem. Recomendamos desativá-la para {{appName}}.',
    additionalInfo:
      'Isso garante que o alarme funcione de forma confiável mesmo quando o economizador de bateria estiver ativo.',
    buttonAllow: 'Abrir Configurações',
    buttonDeny: 'Pular por enquanto',
  },

  displayOverOtherApps: {
    title: 'Permitir aparecer sobre outros apps?',
    description:
      'Esta permissão permite que o alarme abra automaticamente quando o app estiver em segundo plano.',
    additionalInfo:
      'Essencial para que o alarme funcione como apps nativos, abrindo a tela mesmo com o telefone bloqueado.',
    buttonAllow: 'Abrir Configurações',
    buttonDeny: 'Pular por enquanto',
  },

  autoStart: {
    title: 'Habilitar Início Automático?',
    description:
      'Permitir que o WakeMind inicie automaticamente em segundo plano. Necessário em dispositivos {{manufacturer}}.',
    additionalInfo:
      'Sem isso, alarmes podem não tocar quando o app está fechado. Crítico para dispositivos Xiaomi, Huawei, Oppo, Vivo e Samsung.',
    buttonAllow: 'Abrir Configurações',
    buttonDeny: 'Pular por enquanto',
  },

  summary: {
    title: 'Garanta que seu alarme toque',
    description:
      'As permissões de Alarme e Notificação nos permitem tocar quando o telefone está bloqueado',
    alarmsLabel: 'Alarmes ({{platform}} {{version}})',
    notificationsLabel: 'Notificações',
  },

  buttons: {
    allow: 'Permitir',
    dontAllow: 'Não Permitir',
    next: 'Próximo',
    skip: 'Pular',
  },

  // Alarm Permissions Modal (for first alarm creation)
  alarmPermissions: {
    progress: 'Permissão {{current}} / {{total}}',

    intro: {
      title: 'Não deixe os seus alarmes ficarem silenciosos',
      description: 'Para funcionar perfeitamente, precisamos de 2 permissões importantes',
      step1Title: 'Aparecer sobre outros apps',
      step1Description: 'Abrir o alarme automaticamente, mesmo com a tela bloqueada',
      step2Title: 'Início automático',
      step2Description: 'Garantir que o alarme sempre toque, mesmo em segundo plano',
      footer: 'Você pode configurar isso agora ou fazer mais tarde nas configurações',
    },

    systemAlertWindow: {
      title: 'Para desligar o alarme sem desbloquear',
      description: 'Conceda a permissão de Aparecer sobre outras aplicações',
      benefitTitle: 'Por que precisamos?',
      benefit:
        'Permite que o app abra automaticamente sobre a tela de bloqueio quando o alarme tocar. Você poderá desligar ou adiar sem desbloquear o celular.',
    },

    batteryOptimization: {
      title: 'Para que o alarme sempre toque',
      description: 'Conceda a permissão de Início automático em segundo plano',
      benefitTitle: 'Garantia de confiabilidade',
      benefit:
        'Garante que seus alarmes toquem mesmo quando o app está fechado ou em economia de bateria. Crítico para funcionamento 24/7.',
    },

    complete: {
      title: 'Tudo pronto! 🎉',
      description: 'Suas permissões foram configuradas. Seu alarme funcionará perfeitamente.',
      feature1: 'Alarme abre automaticamente na tela bloqueada',
      feature2: 'Funciona mesmo com app fechado ou bateria economizada',
    },

    buttons: {
      getStarted: 'Continuar',
      openSettings: 'Aceder às definições',
      skipForNow: 'Agora não',
      done: 'Concluir',
    },

    accessibility: {
      close: 'Fechar',
      closeHint: 'Fechar modal de permissões',
      nextHint: 'Prosseguir para o próximo passo',
      skipLabel: 'Agora não',
      skipHint: 'Ignorar configuração de permissões',
      loading: 'Carregando...',
    },

    illustration: {
      autoStart: 'Início Automático',
      displayOver: 'Exibir Sobre',
      statusPending: 'Status: Pendente',
    },
  },
};
