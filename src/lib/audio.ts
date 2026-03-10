/**
 * Professional Game Audio Manager
 * Handles all game sounds, music, and audio feedback
 * Uses Web Audio API for low-latency playback
 */

export type SoundType = 
  | 'correct'
  | 'wrong'
  | 'click'
  | 'powerup'
  | 'levelup'
  | 'gameover'
  | 'victory'
  | 'combo'
  | 'countdown'
  | 'checkpoint'
  | 'engine'
  | 'explosion'
  | 'shield'
  | 'boost';

export interface AudioManagerOptions {
  masterVolume?: number;
  sfxVolume?: number;
  musicVolume?: number;
  enabled?: boolean;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private enabled: boolean = true;
  private soundBuffers: Map<SoundType, AudioBuffer> = new Map();
  private activeSources: AudioBufferSourceNode[] = [];
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const saved = localStorage.getItem('mathquest_audio');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.masterVolume = settings.masterVolume ?? 1.0;
        this.sfxVolume = settings.sfxVolume ?? 0.7;
        this.musicVolume = settings.musicVolume ?? 0.5;
        this.enabled = settings.enabled ?? true;
      } catch (e) {
        console.warn('Failed to load audio settings');
      }
    }
  }

  saveSettings() {
    localStorage.setItem('mathquest_audio', JSON.stringify({
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      enabled: this.enabled
    }));
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      
      this.masterGain.connect(this.audioContext.destination);
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      
      this.sfxGain.gain.value = this.sfxVolume;
      this.musicGain.gain.value = this.musicVolume;
      this.masterGain.gain.value = this.masterVolume;
      
      // Generate procedural sounds
      await this.generateSounds();
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  private async generateSounds() {
    if (!this.audioContext) return;

    // Generate procedural sounds using oscillators and noise
    const sampleRate = this.audioContext.sampleRate;
    
    // Correct answer - ascending chime
    this.soundBuffers.set('correct', this.createToneBuffer([
      { freq: 523.25, duration: 0.1 }, // C5
      { freq: 659.25, duration: 0.15 }, // E5
    ], 0.2));

    // Wrong answer - descending buzz
    this.soundBuffers.set('wrong', this.createToneBuffer([
      { freq: 200, duration: 0.15 },
      { freq: 150, duration: 0.2 },
    ], 0.3, 'sawtooth'));

    // Click/UI sound
    this.soundBuffers.set('click', this.createToneBuffer([
      { freq: 800, duration: 0.05 },
    ], 0.05));

    // Powerup - ascending arpeggio
    this.soundBuffers.set('powerup', this.createToneBuffer([
      { freq: 440, duration: 0.1 },
      { freq: 554.37, duration: 0.1 },
      { freq: 659.25, duration: 0.1 },
      { freq: 880, duration: 0.2 },
    ], 0.4));

    // Level up - triumphant fanfare
    this.soundBuffers.set('levelup', this.createToneBuffer([
      { freq: 523.25, duration: 0.15 },
      { freq: 659.25, duration: 0.15 },
      { freq: 783.99, duration: 0.15 },
      { freq: 1046.50, duration: 0.4 },
    ], 0.6));

    // Game over - descending minor
    this.soundBuffers.set('gameover', this.createToneBuffer([
      { freq: 392, duration: 0.3 },
      { freq: 349.23, duration: 0.3 },
      { freq: 329.63, duration: 0.4 },
      { freq: 293.66, duration: 0.5 },
    ], 1.0, 'triangle'));

    // Victory - triumphant chord
    this.soundBuffers.set('victory', this.createToneBuffer([
      { freq: 523.25, duration: 0.2 },
      { freq: 659.25, duration: 0.2 },
      { freq: 783.99, duration: 0.2 },
      { freq: 1046.50, duration: 0.6 },
    ], 0.8));

    // Combo - rapid ascending
    this.soundBuffers.set('combo', this.createToneBuffer([
      { freq: 600, duration: 0.08 },
      { freq: 720, duration: 0.08 },
      { freq: 840, duration: 0.08 },
    ], 0.15));

    // Countdown beep
    this.soundBuffers.set('countdown', this.createToneBuffer([
      { freq: 880, duration: 0.1 },
    ], 0.1));

    // Checkpoint
    this.soundBuffers.set('checkpoint', this.createToneBuffer([
      { freq: 698.46, duration: 0.15 },
      { freq: 880, duration: 0.25 },
    ], 0.3));

    // Engine hum
    this.soundBuffers.set('engine', this.createNoiseBuffer(0.5, 'lowpass', 200));

    // Explosion
    this.soundBuffers.set('explosion', this.createNoiseBuffer(0.8, 'lowpass', 1000));

    // Shield activate
    this.soundBuffers.set('shield', this.createToneBuffer([
      { freq: 440, duration: 0.3 },
      { freq: 554.37, duration: 0.3 },
    ], 0.4, 'sine'));

    // Boost/Nitro
    this.soundBuffers.set('boost', this.createNoiseBuffer(0.6, 'bandpass', 800));
  }

  private createToneBuffer(
    tones: { freq: number; duration: number }[], 
    totalDuration: number,
    waveType: OscillatorType = 'sine'
  ): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * totalDuration, sampleRate);
    const data = buffer.getChannelData(0);
    
    let time = 0;
    const attackTime = 0.01;
    const releaseTime = 0.05;
    
    for (const tone of tones) {
      const samples = Math.floor(tone.duration * sampleRate);
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const envelope = Math.min(
          (i < attackTime * sampleRate) ? i / (attackTime * sampleRate) : 1,
          (i > samples - releaseTime * sampleRate) ? (samples - i) / (releaseTime * sampleRate) : 1
        );
        
        // Generate waveform
        let sample = 0;
        switch (waveType) {
          case 'square':
            sample = Math.sin(2 * Math.PI * tone.freq * t) > 0 ? 1 : -1;
            break;
          case 'sawtooth':
            sample = ((tone.freq * t) % 1) * 2 - 1;
            break;
          case 'triangle':
            sample = Math.abs(((tone.freq * t) % 1) * 4 - 2) - 1;
            break;
          default:
            sample = Math.sin(2 * Math.PI * tone.freq * t);
        }
        
        data[time + i] = sample * envelope * 0.5;
      }
      time += samples;
    }
    
    return buffer;
  }

  private createNoiseBuffer(
    duration: number, 
    filterType: BiquadFilterType = 'lowpass',
    frequency: number = 1000
  ): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }

  play(sound: SoundType, volume: number = 1.0) {
    if (!this.enabled || !this.audioContext || !this.sfxGain || !this.sfxBuffers.has(sound)) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.soundBuffers.get(sound) || null;
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.sfxGain);
      
      source.start(0);
      this.activeSources.push(source);
      
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) this.activeSources.splice(index, 1);
      };
    } catch (error) {
      console.warn('Failed to play sound:', sound);
    }
  }

  private get sfxBuffers(): Map<SoundType, AudioBuffer> {
    return this.soundBuffers;
  }

  playCorrect() { this.play('correct'); }
  playWrong() { this.play('wrong'); }
  playClick() { this.play('click', 0.5); }
  playPowerup() { this.play('powerup'); }
  playLevelup() { this.play('levelup'); }
  playGameover() { this.play('gameover'); }
  playVictory() { this.play('victory'); }
  playCombo() { this.play('combo'); }
  playCountdown() { this.play('countdown', 0.3); }
  playCheckpoint() { this.play('checkpoint'); }
  playExplosion() { this.play('explosion'); }
  playShield() { this.play('shield'); }
  playBoost() { this.play('boost'); }

  // Play combo sound with pitch based on combo count
  playComboSound(comboCount: number) {
    const pitch = Math.min(1 + (comboCount * 0.1), 2);
    this.play('combo', Math.min(0.5 + (comboCount * 0.05), 1));
  }

  setMasterVolume(value: number) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    if (this.masterGain) this.masterGain.gain.value = this.masterVolume;
    this.saveSettings();
  }

  setSfxVolume(value: number) {
    this.sfxVolume = Math.max(0, Math.min(1, value));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
    this.saveSettings();
  }

  setMusicVolume(value: number) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
    this.saveSettings();
  }

  setEnabled(value: boolean) {
    this.enabled = value;
    this.saveSettings();
  }

  getMasterVolume() { return this.masterVolume; }
  getSfxVolume() { return this.sfxVolume; }
  getMusicVolume() { return this.musicVolume; }
  isEnabled() { return this.enabled; }

  // Resume audio context (needed after user interaction)
  async resume() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Stop all currently playing sounds
  stopAll() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    this.activeSources = [];
  }

  // Cleanup
  dispose() {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// React hook for audio
export function useAudio() {
  return audioManager;
}
