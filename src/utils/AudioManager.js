/**
 * AudioManager.js
 * A singleton class to manage all audio functionality for the application
 * Handles background music, sound effects, and text-to-speech
 */

class AudioManager {
  constructor() {
    // Singleton pattern
    if (AudioManager.instance) {
      return AudioManager.instance;
    }
    AudioManager.instance = this;
    
    // Initialize audio properties
    this.bgMusic = null;
    this.soundEffects = {};
    this.isMuted = false;
    this.bgMusicVolume = 0.2; // Default background music volume (low)
    this.sfxVolume = 0.5; // Default sound effects volume
    
    // Initialize Web Speech API if available
    this.speechSynthesis = window.speechSynthesis;
    this.speechUtterance = null;
    
    // Bind methods to maintain context
    this.playBackgroundMusic = this.playBackgroundMusic.bind(this);
    this.stopBackgroundMusic = this.stopBackgroundMusic.bind(this);
    this.playSoundEffect = this.playSoundEffect.bind(this);
    this.speak = this.speak.bind(this);
    this.stopSpeech = this.stopSpeech.bind(this);
    this.setMute = this.setMute.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
  }
  
  /**
   * Initialize audio assets
   * Call this method after the component mounts
   */
  init() {
    // Load background music
    this.bgMusic = new Audio();
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.bgMusicVolume;
    
    // Load sound effects
    this.loadSoundEffects();
    
    // Add event listeners for audio error handling
    this.bgMusic.addEventListener('error', (e) => {
      console.error('Error loading background music:', e);
    });
    
    return this;
  }
  
  /**
   * Load all sound effects
   * Sound effect files should be in the assets folder
   */
  loadSoundEffects() {
    // Define sound effects to load
    const effects = [
      'hover',     // For hovering over interactive elements
      'click',     // For clicking buttons
      'correct',   // For correct answers
      'incorrect', // For incorrect answers
      'celebrate'  // For celebration/completion
    ];
    
    // Create Audio objects for each effect
    effects.forEach(effect => {
      this.soundEffects[effect] = new Audio();
      this.soundEffects[effect].volume = this.sfxVolume;
    });
  }
  
  /**
   * Set the source for background music
   * @param {string} src - Path to the audio file
   */
  setBackgroundMusic(src) {
    if (this.bgMusic) {
      this.bgMusic.src = src;
      this.bgMusic.load();
    }
    return this;
  }
  
  /**
   * Set the source for a sound effect
   * @param {string} name - Name of the sound effect
   * @param {string} src - Path to the audio file
   */
  setSoundEffect(name, src) {
    if (this.soundEffects[name]) {
      this.soundEffects[name].src = src;
      this.soundEffects[name].load();
    }
    return this;
  }
  
  /**
   * Play background music
   */
  playBackgroundMusic() {
    if (this.bgMusic && !this.isMuted) {
      // Use the play() promise to handle autoplay restrictions
      const playPromise = this.bgMusic.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Autoplay prevented:', error);
          // We'll need user interaction to play audio
        });
      }
    }
    return this;
  }
  
  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
    return this;
  }
  
  /**
   * Play a sound effect
   * @param {string} name - Name of the sound effect to play
   */
  playSoundEffect(name) {
    if (this.soundEffects[name] && !this.isMuted) {
      // Clone the audio to allow overlapping sounds
      const sound = this.soundEffects[name].cloneNode();
      sound.volume = this.sfxVolume;
      
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Error playing ${name} sound:`, error);
        });
      }
    }
    return this;
  }
  
  /**
   * Set volume for background music
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setBackgroundMusicVolume(volume) {
    this.bgMusicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.bgMusicVolume;
    }
    return this;
  }
  
  /**
   * Set volume for sound effects
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setSoundEffectVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    Object.values(this.soundEffects).forEach(sound => {
      sound.volume = this.sfxVolume;
    });
    return this;
  }
  
  /**
   * Mute or unmute all audio
   * @param {boolean} mute - Whether to mute audio
   */
  setMute(mute) {
    this.isMuted = mute;
    
    if (this.bgMusic) {
      if (mute) {
        this.bgMusic.pause();
      } else if (this.bgMusic.paused) {
        this.playBackgroundMusic();
      }
    }
    
    return this;
  }
  
  /**
   * Toggle mute state
   */
  toggleMute() {
    return this.setMute(!this.isMuted);
  }
  
  /**
   * Speak text using Web Speech API
   * @param {string} text - Text to speak
   * @param {string} lang - Language code (e.g., 'en-US', 'id-ID', 'tl-PH')
   */
  speak(text, lang = 'en-US') {
    if (!this.speechSynthesis || this.isMuted) {
      return this;
    }
    
    // Cancel any ongoing speech
    this.stopSpeech();
    
    // Create a new utterance
    this.speechUtterance = new SpeechSynthesisUtterance(text);
    this.speechUtterance.lang = lang;
    this.speechUtterance.rate = 0.9; // Slightly slower for educational content
    this.speechUtterance.pitch = 1.0;
    
    // Speak the text
    this.speechSynthesis.speak(this.speechUtterance);
    
    return this;
  }
  
  /**
   * Stop any ongoing speech
   */
  stopSpeech() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    return this;
  }
  
  /**
   * Clean up resources
   * Call this method when the component unmounts
   */
  cleanup() {
    this.stopBackgroundMusic();
    this.stopSpeech();
    
    // Remove event listeners
    if (this.bgMusic) {
      this.bgMusic.removeEventListener('error', () => {});
    }
    
    return this;
  }
}

// Export a singleton instance
const audioManager = new AudioManager();
export default audioManager;