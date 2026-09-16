// Original slow pentatonic phrase. No external audio or network dependency.
export function startMenuMusic(volume: number) {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = volume * 0.12;
  master.connect(context.destination);
  const notes = [146.83, 220, 261.63, 293.66, 220, 196, 164.81, 220];
  let step = 0;
  const play = () => {
    const time = context.currentTime;
    for (const frequency of [notes[step++ % notes.length], 73.415]) {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(0, time);
      envelope.gain.linearRampToValueAtTime(0.35, time + 0.4);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 3.8);
      oscillator.connect(envelope); envelope.connect(master);
      oscillator.start(time); oscillator.stop(time + 4);
    }
  };
  void context.resume(); play();
  const timer = window.setInterval(play, 2200);
  return { volume(value: number) { master.gain.setTargetAtTime(value * 0.12, context.currentTime, 0.1); },
    stop() { window.clearInterval(timer); void context.close(); } };
}
