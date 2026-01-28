package expo.modules.alarmactivity

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log

/**
 * Helper para abrir configurações específicas de fabricantes
 * Essencial para alarmes funcionarem corretamente em dispositivos com otimizações agressivas
 */
object ManufacturerPermissionsHelper {
    private const val TAG = "ManufacturerPermissions"

    /**
     * Detecta o fabricante do dispositivo
     */
    fun getDeviceManufacturer(): String {
        return Build.MANUFACTURER.lowercase()
    }

    /**
     * Verifica se é um dispositivo Xiaomi/Redmi
     */
    fun isXiaomi(): Boolean {
        val manufacturer = getDeviceManufacturer()
        return manufacturer.contains("xiaomi") || manufacturer.contains("redmi")
    }

    /**
     * Verifica se é Huawei
     */
    fun isHuawei(): Boolean {
        return getDeviceManufacturer().contains("huawei")
    }

    /**
     * Verifica se é Oppo
     */
    fun isOppo(): Boolean {
        return getDeviceManufacturer().contains("oppo")
    }

    /**
     * Verifica se é Vivo
     */
    fun isVivo(): Boolean {
        return getDeviceManufacturer().contains("vivo")
    }

    /**
     * Verifica se é Samsung
     */
    fun isSamsung(): Boolean {
        return getDeviceManufacturer().contains("samsung")
    }

    /**
     * Verifica se o dispositivo requer configuração manual de AutoStart
     * (Xiaomi, Huawei, Oppo, Vivo, Samsung)
     */
    fun requiresManufacturerAutoStart(): Boolean {
        return isXiaomi() || isHuawei() || isOppo() || isVivo() || isSamsung()
    }

    /**
     * Abre configurações de AutoStart específicas do fabricante
     */
    fun openAutoStartSettings(context: Context): Boolean {
        try {
            val manufacturer = getDeviceManufacturer()
            val intent = when {
                isXiaomi() -> getXiaomiAutoStartIntent(context)
                isHuawei() -> getHuaweiAutoStartIntent(context)
                isOppo() -> getOppoAutoStartIntent(context)
                isVivo() -> getVivoAutoStartIntent(context)
                isSamsung() -> getSamsungAutoStartIntent(context)
                else -> null
            }

            if (intent != null) {
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
                Log.d(TAG, "Opened AutoStart settings for: $manufacturer")
                return true
            } else {
                Log.w(TAG, "No AutoStart settings found for: $manufacturer")
                // Fallback para configurações gerais do app
                openAppSettings(context)
                return false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error opening AutoStart settings", e)
            openAppSettings(context)
            return false
        }
    }

    /**
     * Xiaomi/Redmi AutoStart
     */
    private fun getXiaomiAutoStartIntent(context: Context): Intent? {
        return try {
            Intent().apply {
                component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"
                )
            }
        } catch (e: Exception) {
            try {
                // Fallback para versões antigas da MIUI
                Intent("miui.intent.action.APP_PERM_EDITOR").apply {
                    setClassName(
                        "com.miui.securitycenter",
                        "com.miui.permcenter.permissions.PermissionsEditorActivity"
                    )
                    putExtra("extra_pkgname", context.packageName)
                }
            } catch (e2: Exception) {
                null
            }
        }
    }

    /**
     * Huawei AutoStart
     */
    private fun getHuaweiAutoStartIntent(context: Context): Intent? {
        return try {
            Intent().apply {
                component = ComponentName(
                    "com.huawei.systemmanager",
                    "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"
                )
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Oppo AutoStart
     */
    private fun getOppoAutoStartIntent(context: Context): Intent? {
        return try {
            Intent().apply {
                component = ComponentName(
                    "com.coloros.safecenter",
                    "com.coloros.safecenter.permission.startup.StartupAppListActivity"
                )
            }
        } catch (e: Exception) {
            try {
                Intent().apply {
                    component = ComponentName(
                        "com.oppo.safe",
                        "com.oppo.safe.permission.startup.StartupAppListActivity"
                    )
                }
            } catch (e2: Exception) {
                null
            }
        }
    }

    /**
     * Vivo AutoStart
     */
    private fun getVivoAutoStartIntent(context: Context): Intent? {
        return try {
            Intent().apply {
                component = ComponentName(
                    "com.vivo.permissionmanager",
                    "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"
                )
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Samsung AutoStart (menos restritivo que Xiaomi)
     */
    private fun getSamsungAutoStartIntent(context: Context): Intent? {
        return try {
            Intent().apply {
                component = ComponentName(
                    "com.samsung.android.lool",
                    "com.samsung.android.sm.ui.battery.BatteryActivity"
                )
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Abre configurações gerais do app (fallback)
     */
    fun openAppSettings(context: Context) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:${context.packageName}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            Log.d(TAG, "Opened app settings")
        } catch (e: Exception) {
            Log.e(TAG, "Error opening app settings", e)
        }
    }

    /**
     * Abre configurações de Battery Optimization
     */
    fun openBatteryOptimizationSettings(context: Context) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
                Log.d(TAG, "Opened battery optimization settings")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error opening battery settings", e)
            openAppSettings(context)
        }
    }

    /**
     * Abre configurações de Display Over Other Apps
     */
    fun openDisplayOverOtherAppsSettings(context: Context) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")
                ).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
                Log.d(TAG, "Opened overlay permission settings")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error opening overlay settings", e)
            openAppSettings(context)
        }
    }

    /**
     * Verifica se Display Over Other Apps está habilitado
     */
    fun canDrawOverlays(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(context)
        } else {
            true // Não necessário em versões antigas
        }
    }

    /**
     * Abre configurações de Do Not Disturb (Xiaomi)
     */
    fun openDoNotDisturbSettings(context: Context) {
        try {
            if (isXiaomi()) {
                val intent = Intent().apply {
                    component = ComponentName(
                        "com.android.settings",
                        "com.android.settings.Settings\$ZenModeSettingsActivity"
                    )
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
                Log.d(TAG, "Opened DND settings")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error opening DND settings", e)
        }
    }

    /**
     * Retorna uma mensagem genérica sobre permissões de fabricante
     */
    fun getManufacturerSpecificMessage(): String {
        return if (requiresManufacturerAutoStart()) {
            "Seu dispositivo requer permissões especiais. Configure AutoStart e Battery Optimization para garantir que alarmes funcionem corretamente."
        } else {
            ""
        }
    }
}
