export default {
  title: 'Configura tu hora de alarma',
  progressLabel: '{{current}}/{{total}}',

  notifications: {
    ios: {
      title: '¿Permitir que "{{appName}}" programe alarmas y temporizadores?',
      description:
        'Esto permitirá que la app programe alarmas y temporizadores que pueden reproducir sonidos y aparecer en la pantalla incluso si está activo un Modo de concentración.',
      additionalInfo:
        'Necesitamos este permiso para que suene la alarma cuando el teléfono esté bloqueado.',
    },
    android: {
      title: '¿Permitir que {{appName}} envíe notificaciones?',
      description:
        'Las notificaciones son esenciales para que suene tu alarma. Sin este permiso, las alarmas no funcionarán.',
      additionalInfo: 'Puedes personalizar la configuración de notificaciones más tarde en la app.',
    },
    general: {
      title: '"{{appName}}" Quisiera Enviarte Notificaciones',
      description:
        'Las notificaciones pueden incluir alertas, sonidos e insignias de ícono. Se pueden configurar en Ajustes.',
    },
  },

  exactAlarms: {
    title: '¿Permitir programación precisa de alarmas?',
    description:
      'Este permiso garantiza que tu alarma suene exactamente a tiempo, incluso cuando tu teléfono esté en modo de ahorro de energía profundo.',
    additionalInfo: 'Necesario para Android 12+ para programar alarmas exactas.',
  },

  batteryOptimization: {
    title: '¿Desactivar optimización de batería?',
    description:
      'La optimización de batería puede impedir que suenen las alarmas. Recomendamos desactivarla para {{appName}}.',
    additionalInfo:
      'Esto garantiza que la alarma funcione de manera confiable incluso cuando el ahorro de batería esté activo.',
    buttonAllow: 'Abrir Ajustes',
    buttonDeny: 'Omitir por ahora',
  },

  displayOverOtherApps: {
    title: '¿Permitir mostrar sobre otras apps?',
    description:
      'Este permiso permite que la alarma se abra automáticamente cuando la app esté en segundo plano.',
    additionalInfo:
      'Esencial para que la alarma funcione como apps de alarma nativas, abriendo la pantalla incluso con el teléfono bloqueado.',
    buttonAllow: 'Abrir Ajustes',
    buttonDeny: 'Omitir por ahora',
  },

  autoStart: {
    title: '¿Habilitar Inicio Automático?',
    description:
      'Permitir que WakeMind se inicie automáticamente en segundo plano. Necesario en dispositivos {{manufacturer}}.',
    additionalInfo:
      'Sin esto, las alarmas pueden no sonar cuando la app está cerrada. Crítico para dispositivos Xiaomi, Huawei, Oppo, Vivo y Samsung.',
    buttonAllow: 'Abrir Ajustes',
    buttonDeny: 'Omitir por ahora',
  },

  summary: {
    title: 'Asegura que suene tu alarma',
    description:
      'Los permisos de Alarma y Notificación nos permiten sonar cuando el teléfono está bloqueado',
    alarmsLabel: 'Alarmas ({{platform}} {{version}})',
    notificationsLabel: 'Notificaciones',
  },

  buttons: {
    allow: 'Permitir',
    dontAllow: 'No Permitir',
    next: 'Siguiente',
    skip: 'Omitir',
  },

  // Alarm Permissions Modal (for first alarm creation)
  alarmPermissions: {
    progress: 'Permiso {{current}} / {{total}}',

    intro: {
      title: 'No dejes que tus alarmas queden en silencio',
      description: 'Para funcionar perfectamente, necesitamos 2 permisos importantes',
      step1Title: 'Mostrar sobre otras apps',
      step1Description: 'Abrir la alarma automáticamente, incluso con pantalla bloqueada',
      step2Title: 'Inicio automático',
      step2Description: 'Garantizar que la alarma siempre suene, incluso en segundo plano',
      footer: 'Puedes configurar esto ahora o hacerlo más tarde en ajustes',
    },

    systemAlertWindow: {
      title: 'Para desactivar la alarma sin desbloquear',
      description: 'Conceda permiso para Mostrar sobre otras aplicaciones',
      benefitTitle: '¿Por qué lo necesitamos?',
      benefit:
        'Permite que la app se abra automáticamente sobre la pantalla de bloqueo cuando suene la alarma. Podrás desactivar o posponer sin desbloquear tu teléfono.',
    },

    batteryOptimization: {
      title: 'Para que la alarma siempre suene',
      description: 'Conceda permiso para Inicio automático en segundo plano',
      benefitTitle: 'Garantía de confiabilidad',
      benefit:
        'Garantiza que tus alarmas suenen incluso cuando la app esté cerrada o en modo de ahorro de batería. Crítico para funcionamiento 24/7.',
    },

    complete: {
      title: '¡Todo listo! 🎉',
      description: 'Tus permisos están configurados. Tu alarma funcionará perfectamente.',
      feature1: 'La alarma se abre automáticamente en la pantalla de bloqueo',
      feature2: 'Funciona incluso con la app cerrada o ahorro de batería activado',
    },

    buttons: {
      getStarted: 'Comenzar',
      openSettings: 'Abrir Ajustes',
      skipForNow: 'Ahora no',
      done: 'Finalizar',
    },

    accessibility: {
      close: 'Cerrar',
      closeHint: 'Cerrar modal de permisos',
      nextHint: 'Continuar al siguiente paso',
      skipLabel: 'Ahora no',
      skipHint: 'Omitir configuración de permisos',
      loading: 'Cargando...',
    },

    illustration: {
      autoStart: 'Inicio Automático',
      displayOver: 'Mostrar Sobre',
      statusPending: 'Estado: Pendiente',
    },
  },
};
