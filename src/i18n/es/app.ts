export const appES = {
  // Alarms Screen
  'alarms.title': 'Tus Alarmas',
  'alarms.edit': 'Editar',
  'alarms.done': 'Listo',
  'alarms.newAlarm': 'Nueva Alarma',
  'alarms.emptyTitle': 'Sin Alarmas Configuradas',
  'alarms.emptyDescription':
    'Tu enfoque matutino comienza aquí. Configura tu hora de despertar para activar tu día.',
  'alarms.setFirstAlarm': 'Configurar Primera Alarma',

  // Alarm Card
  'alarm.daily': 'Diariamente',
  'alarm.weekdays': 'Días laborables',
  'alarm.weekends': 'Fines de semana',
  'alarm.once': 'Una vez',
  'alarm.monday': 'Lun',
  'alarm.tuesday': 'Mar',
  'alarm.wednesday': 'Mié',
  'alarm.thursday': 'Jue',
  'alarm.friday': 'Vie',
  'alarm.saturday': 'Sáb',
  'alarm.sunday': 'Dom',

  // Challenges
  'challenge.math': 'Desafío de Matemáticas',
  'challenge.memory': 'Juego de Memoria',
  'challenge.squats': 'Desafío de Sentadillas',
  'challenge.barcode': 'Escanear Código',

  // New Alarm Screen
  'newAlarm.title': 'Nuevo Alarme',
  'newAlarm.reset': 'Restablecer',
  'newAlarm.commit': 'Confirmar para {{time}}',
  'newAlarm.cognitiveActivation.title': 'Activación Cognitiva',
  'newAlarm.cognitiveActivation.required': 'Obligatorio',
  'newAlarm.challenges.math.title': 'Desafío de Matemáticas',
  'newAlarm.challenges.math.description':
    'Resuelve 5 ecuaciones aritméticas para detener la alarma.',
  'newAlarm.challenges.memory.title': 'Matriz de Memoria',
  'newAlarm.challenges.memory.description': 'Memoriza y recuerda un patrón de bloques iluminados.',
  'newAlarm.challenges.logic.title': 'Rompecabezas Lógico',
  'newAlarm.challenges.logic.description':
    'Completa la secuencia para demostrar que estás despierto.',
  'newAlarm.difficulty.label': 'Nivel de Dificultad',
  'newAlarm.difficulty.easy': 'Fácil',
  'newAlarm.difficulty.easyDescription':
    'Desafíos básicos. Perfecto para quienes tienen el sueño ligero.',
  'newAlarm.difficulty.medium': 'Medio',
  'newAlarm.difficulty.mediumDescription': 'Desafíos moderados. Rutina estándar de despertar.',
  'newAlarm.difficulty.hard': 'Difícil',
  'newAlarm.difficulty.hardDescription':
    'Desafíos complejos. Para quienes tienen el sueño profundo.',
  'newAlarm.difficulty.adaptive': 'Adaptativo',
  'newAlarm.difficulty.adaptiveDescription':
    'IA ajusta la dificultad según tu historial de despertar.',
  'newAlarm.schedule.label': 'Horario',
  'newAlarm.schedule.daily': 'Diario',
  'newAlarm.schedule.weekdays': 'Laborables',
  'newAlarm.schedule.weekends': 'Fines',
  'newAlarm.schedule.once': 'Una vez',
  'newAlarm.schedule.customLabel': 'Horario Personalizado',
  'newAlarm.schedule.days.mon': 'Lun',
  'newAlarm.schedule.days.tue': 'Mar',
  'newAlarm.schedule.days.wed': 'Mié',
  'newAlarm.schedule.days.thu': 'Jue',
  'newAlarm.schedule.days.fri': 'Vie',
  'newAlarm.schedule.days.sat': 'Sáb',
  'newAlarm.schedule.days.sun': 'Dom',
  'newAlarm.backupProtocols.title': 'Protocolos de Respaldo',
  'newAlarm.backupProtocols.snooze.title': 'Posponer',
  'newAlarm.backupProtocols.snooze.description': 'Estricto (Deshabilitado)',
  'newAlarm.backupProtocols.wakeCheck.title': 'Verificación de Despertar',
  'newAlarm.backupProtocols.wakeCheck.description': 'Confirmar 5m después de alarma',
  'newAlarm.backupProtocols.barcodeScan.title': 'Escanear Código',
  'newAlarm.backupProtocols.barcodeScan.description': 'Escanea pasta de dientes para desactivar',
  'newAlarm.backupProtocols.infoModal.title': '¿Qué son los Protocolos de Respaldo?',
  'newAlarm.backupProtocols.infoModal.description':
    'Los Protocolos de Respaldo son mecanismos de seguridad que garantizan que realmente te despiertes, incluso si no puedes desactivar la alarma principal con el desafío cognitivo.',
  'newAlarm.backupProtocols.infoModal.whyTitle': '¿Por qué son importantes?',
  'newAlarm.backupProtocols.infoModal.benefit1': 'Garantía cero-fallas - vas a despertar',
  'newAlarm.backupProtocols.infoModal.benefit2': 'Previene volver a dormir',
  'newAlarm.backupProtocols.infoModal.benefit3': 'Fuerza el compromiso físico y cognitivo',
  'newAlarm.backupProtocols.infoModal.protocolsTitle': 'Protocolos Disponibles',
  'newAlarm.backupProtocols.infoModal.snoozeDescription':
    'La función de posponer está estrictamente controlada o deshabilitada por defecto. Posponer fácilmente sería contraproducente para una alarma enfocada en rendimiento.',
  'newAlarm.backupProtocols.infoModal.wakeCheckDescription':
    'Después de desactivar la alarma, la app solicita una confirmación 5 minutos después para asegurar que no has vuelto a dormir.',
  'newAlarm.backupProtocols.infoModal.barcodeScanDescription':
    'Te obliga a escanear un código de barras (como pasta de dientes) para desactivar completamente la alarma, requiriendo que te levantes de la cama.',
  'newAlarm.validationError.title': 'Alarma Inválida',
  'newAlarm.error.title': 'Error',
  'newAlarm.error.message': 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',

  // Validation Errors
  'validation.alarm.timeRequired': 'La hora es requerida y debe ser una cadena de texto',
  'validation.alarm.timeFormat': 'Formato de hora inválido. Formato esperado: HH:MM (ej., "05:30")',
  'validation.alarm.periodRequired': 'El período (AM/PM) es requerido',
  'validation.alarm.periodInvalid': 'Período inválido. Debe ser "AM" o "PM"',
  'validation.alarm.duplicate': 'Ya existe una alarma para {{time}} {{period}}',
  'validation.alarm.challengeRequired': 'El tipo de desafío es requerido',
  'validation.alarm.challengeIconRequired': 'El ícono del desafío es requerido',
  'validation.alarm.scheduleRequired': 'El horario es requerido',
  'validation.alarm.notFound': 'Alarma no encontrada',

  // Edit Alarm Screen
  'editAlarm.title': 'Editar Alarma',
  'editAlarm.save': 'Guardar Cambios',

  // Common
  'common.am': 'AM',
  'common.pm': 'PM',
  'common.save': 'Guardar',
  'common.cancel': 'Cancelar',
  'common.delete': 'Eliminar',
  'common.confirm': 'Confirmar',
  'common.ok': 'OK',
  'common.info': 'Más información',
  'common.close': 'Cerrar',
  'common.back': 'Atrás',
};
