
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { SpeechClient } from '@google-cloud/speech';
import { IndicTranslator } from '../indic_trans';
import { WebSocket } from 'ws';

export class ConversationProcessor {
  private ttsClient: TextToSpeechClient;
  private sttClient: SpeechClient;
  private translator: IndicTranslator;

  constructor() {
    this.ttsClient = new TextToSpeechClient();
    this.sttClient = new SpeechClient();
    this.translator = new IndicTranslator();
  }

  async generateDiscussion(content: string, targetLanguage: string = 'en') {
    const segments = await this.splitContentIntoSegments(content);
    const voices = [
      { name: 'en-IN-Neural2-A', pitch: 0 },
      { name: 'en-IN-Neural2-B', pitch: -2 }
    ];

    const audioSegments = [];
    for (let i = 0; i < segments.length; i++) {
      const voice = voices[i % 2];
      const translatedText = await this.translator.translate(segments[i], 'en', targetLanguage);
      
      const [response] = await this.ttsClient.synthesizeSpeech({
        input: { text: translatedText },
        voice: { languageCode: 'en-IN', name: voice.name },
        audioConfig: { audioEncoding: 'MP3', pitch: voice.pitch }
      });

      audioSegments.push({
        audio: response.audioContent,
        text: translatedText,
        speaker: i % 2
      });
    }

    return audioSegments;
  }

  private splitContentIntoSegments(content: string): string[] {
    return content.split(/[.!?]/).filter(s => s.trim().length > 0);
  }

  async handleUserQuestion(audioBuffer: Buffer, language: string): Promise<string> {
    const [response] = await this.sttClient.recognize({
      audio: { content: audioBuffer },
      config: { languageCode: language }
    });

    const transcript = response.results[0].alternatives[0].transcript;
    return this.translator.translate(transcript, language, 'en');
  }
}
