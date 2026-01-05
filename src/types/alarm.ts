export interface Alarm {
  id: string;
  time: string; // "05:30"
  period: 'AM' | 'PM';
  challenge: string; // "Math Challenge"
  challengeIcon: string; // Material icon name
  schedule: string; // "Daily", "Mon, Wed, Fri", etc.
  isEnabled: boolean;
}
