let context;

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!context) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    context = new AudioCtx();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(audio, { frequency, start = 0, duration = 0.16, type = 'sine', volume = 0.06 }) {
  const now = audio.currentTime;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now + start);

  gain.gain.setValueAtTime(0.0001, now + start);
  gain.gain.linearRampToValueAtTime(volume, now + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(now + start);
  oscillator.stop(now + start + duration + 0.02);
}

function play(sequence, enabled) {
  if (enabled === false) return;
  const audio = getContext();
  if (!audio) return;
  sequence.forEach((note) => tone(audio, note));
}

export function playCorrect(enabled = true) {
  play(
    [
      { frequency: 523.25, start: 0, duration: 0.14, type: 'triangle' },
      { frequency: 659.25, start: 0.08, duration: 0.14, type: 'triangle' },
      { frequency: 783.99, start: 0.16, duration: 0.22, type: 'triangle' },
    ],
    enabled
  );
}

export function playWrong(enabled = true) {
  play(
    [
      { frequency: 196, start: 0, duration: 0.16, type: 'sawtooth', volume: 0.045 },
      { frequency: 155.56, start: 0.12, duration: 0.24, type: 'sawtooth', volume: 0.045 },
    ],
    enabled
  );
}

export function playWin(enabled = true) {
  play(
    [
      { frequency: 523.25, start: 0, duration: 0.12, type: 'triangle' },
      { frequency: 659.25, start: 0.1, duration: 0.12, type: 'triangle' },
      { frequency: 783.99, start: 0.2, duration: 0.12, type: 'triangle' },
      { frequency: 1046.5, start: 0.3, duration: 0.3, type: 'triangle' },
    ],
    enabled
  );
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

if (canSpeak()) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    window.speechSynthesis.getVoices();
  });
}

function pickVoice(lang) {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const prefix = lang.split('-')[0].toLowerCase();
  return (
    voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase()) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix)) ||
    null
  );
}

export function speak(text, lang = 'en-US', enabled = true, rate = 0.95, onEnd, pitch = 1) {
  if (!canSpeak() || enabled === false || !text) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  if (typeof onEnd === 'function') {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  synth.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
