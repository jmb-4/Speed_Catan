/**
 * Config – statische Konstanten und Defaults.
 * Einzige Quelle für Farben und Texte.
 */

export const PLAYER_COLORS = [
  { name: 'Rot',    value: '#d84545' },
  { name: 'Blau',   value: '#3878d8' },
  { name: 'Orange', value: '#e07b00' },
  { name: 'Weiß',   value: '#f4f3ef', border: 'var(--white-piece-border)' },
  { name: 'Braun',  value: '#7a4f2a' },
  { name: 'Grün',   value: '#3a9e5f' },
];

export const DEFAULT_PLAYER_COUNT = 6;
export const DEFAULT_SETUP_TIME  = 75;
export const DEFAULT_ACTION_TIME = 45;
export const ROBBER_BONUS       = 15;
export const MIN_TIME           = 10;
export const MAX_TIME           = 300;
