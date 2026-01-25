import ExpoModulesCore

public class ExpoAlarmsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAlarms")

    Function("getTheme") { () -> String in
      "system"
    }
  }
}
