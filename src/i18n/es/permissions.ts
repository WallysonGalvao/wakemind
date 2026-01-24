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
};
